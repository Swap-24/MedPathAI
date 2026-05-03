from data_loader import (
    search_hospitals,
    search_best_hospitals_by_city,
    get_city_info,
    SUPPORTED_PROCEDURES
)

def run_provider_node(state: dict) -> dict:
    """
    Finds and scores hospitals based on extracted intent.
    Pure Python — no Gemini call.
    Returns updated state with ranked hospital list.
    """
    nodes_visited = state.get("nodes_visited", [])
    nodes_visited.append("provider")

    procedure     = state.get("procedure")
    city          = state.get("city")
    budget        = state.get("budget")
    deadline_days = state.get("deadline_days")
    is_emergency  = state.get("is_emergency", False)
    profile       = state.get("user_profile", {})

    # Fallback to profile city if not extracted
    if not city:
        city = profile.get("city")

    # If still no city
    if not city:
        return {
            **state,
            "hospitals":      [],
            "provider_error": "Could not determine city. Please specify your city.",
            "nodes_visited":  nodes_visited,
        }

    # Get city info for the searched hospital city.
    city_info = get_city_info(city)

    # Distance origin:
    # 1. GPS coordinates when the user has granted location access.
    # 2. Otherwise, the current city saved in the user's profile.
    gps_lat = state.get("user_lat")
    gps_lon = state.get("user_lon")
    if gps_lat is not None and gps_lon is not None:
        user_lat = gps_lat
        user_lon = gps_lon
    else:
        profile_city_info = get_city_info(profile.get("city")) if profile.get("city") else None
        user_lat = profile_city_info["latitude"] if profile_city_info else None
        user_lon = profile_city_info["longitude"] if profile_city_info else None

    # If emergency and no procedure — default to angioplasty
    # (most common cardiac emergency procedure)
    if is_emergency and not procedure:
        procedure = "angioplasty"

    fallback_note = None

    # If still no procedure, use a broad diagnostic fallback so the user still
    # gets hospitals to contact instead of a dead end.
    if not procedure:
        procedure = "ct_scan"
        fallback_note = "Used general diagnostic fallback because no exact supported procedure matched."

    # Search hospitals
    hospitals = search_hospitals(
        city          = city,
        procedure_name= procedure,
        budget        = budget,
        deadline_days = deadline_days,
        is_emergency  = is_emergency,
        user_lat      = user_lat,
        user_lon      = user_lon,
        limit         = 3,
    )

    provider_error = None
    exact_procedure_available = True
    if not hospitals:
        exact_procedure_available = False
        hospitals = search_best_hospitals_by_city(
            city         = city,
            budget       = budget,
            is_emergency = is_emergency,
            user_lat     = user_lat,
            user_lon     = user_lon,
            limit        = 3,
        )
        if hospitals:
            provider_error = (
                f"No hospitals in the current database list {procedure} in {city}; "
                "showing the strongest nearby hospitals by rating, accreditation, distance, and support services."
            )
        else:
            provider_error = f"No hospitals found in the current database for {city}."

    # Format for frontend
    formatted = []
    for h in hospitals:
        proc = h.get("procedure", {})
        formatted.append({
            "hospital_id":      h["hospital_id"],
            "hospital_name":    h["hospital_name"],
            "chain":            h["chain"],
            "city":             h["city"],
            "rating":           h["rating"],
            "nabh_accredited":  h["nabh_accredited"],
            "jci_accredited":   h["jci_accredited"],
            "beds":             h["beds"],
            "icu_beds":         h["icu_beds"],
            "emergency_24x7":   h["emergency_24x7"],
            "ambulance":        h["ambulance_available"],
            "cashless_insurance": h["cashless_insurance"],
            "inhouse_critical_care": h["inhouse_critical_care"],
            "consultation_fee": h["consultation_fee_inr"],
            "distance_km":      h["distance_km"],
            "score":            h["score"],
            "over_budget":      h["over_budget"],
            "over_budget_label": h.get("over_budget_label"),

            # Procedure details
            "procedure_name":        procedure,
            "cost_min":              proc.get("min_cost_inr"),
            "cost_max":              proc.get("max_cost_inr"),
            "cost_avg":              proc.get("avg_cost_inr"),
            "success_rate":          proc.get("success_rate"),
            "waiting_days":          proc.get("procedure_waiting_time_days"),
            "avg_recovery_days":     proc.get("avg_recovery_days"),
            "insurance_covered":     proc.get("insurance_covered"),
            "specialists_count":     proc.get("specialists_count"),
            "annual_volume":         proc.get("annual_procedure_volume"),
            "relevance_score":       proc.get("specialization_relevance_score"),
            "procedure_unavailable": h.get("procedure_unavailable", False),
            "exact_procedure_available": exact_procedure_available and not h.get("procedure_unavailable", False),
        })

    return {
        **state,
        "hospitals":      formatted,
        "city_info":      city_info,
        "procedure":      procedure,
        "provider_note":  fallback_note,
        "nodes_visited":  nodes_visited,
        "provider_error": provider_error,
    }
