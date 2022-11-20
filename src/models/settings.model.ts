export interface settings {
    id: number;
    tournamentId: string;
    public_signups: boolean;
    show_signups: boolean;
    public: boolean;
    state: string;
    type: string;
    has_bracket: boolean;
    has_map_pool: boolean;
    signup_comment: string;
    comment_required: boolean;
    bracket_sort_method: string;
    bracket_limit: number;
    quals_cutoff: number;
    show_quals: boolean;
    has_quals: boolean;
    countries: string;
    sort_method: string;
    standard_cutoff: number;
    ta_url: string;
    ta_password: string;
    ta_event_flags: string;
    qual_attempts: number;
    quals_method: string;
}