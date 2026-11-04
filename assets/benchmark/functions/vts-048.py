from pathlib import Path
from core.evaluator import score_evidence


def evaluate_arxiv_filters(evidence, record, task_dir):
    return score_evidence(
        SPEC, evidence=evidence, record=record,
        task=TASK, task_dir=Path(task_dir),
    )


# Complete original evaluator specification.
SPEC = {'spec_version': '1',
 'conj': 'and',
 'checks': [{'name': 'on_target_page',
             'metric': 'url_pattern_match',
             'result': {'type': 'final_url'},
             'expected': {'type': 'const',
                          'value': '^https://arxiv\\.org/search/advanced/?(?:[?#]|$)'}},
            {'name': 'query_subjects_and_submission_dates',
             'metric': 'json_object_match',
             'result': {'type': 'url_parse',
                        'parse_keys': ['terms-0-term',
                                       'terms-0-field',
                                       'classification-computer_science',
                                       'classification-mathematics',
                                       'date-filter_by',
                                       'date-from_date',
                                       'date-to_date',
                                       'date-date_type',
                                       'terms-1-term',
                                       'classification-physics',
                                       'classification-quantitative_biology',
                                       'classification-quantitative_finance',
                                       'classification-statistics',
                                       'classification-economics',
                                       'classification-electrical_engineering_and_systems_science']},
             'expected': {'type': 'const',
                          'value': {'terms-0-term': {'re': '^\\s*"?reinforcement '
                                                           'learning"?\\s*$',
                                                     'flags': 'I'},
                                    'terms-0-field': {'eq': 'all'},
                                    'classification-computer_science': {'eq': 'y'},
                                    'classification-mathematics': {'eq': 'y'},
                                    'date-filter_by': {'eq': 'date_range'},
                                    'date-from_date': {'eq': '2024-09-01'},
                                    'date-to_date': {'eq': '2025-01-31'},
                                    'date-date_type': {'eq': 'submitted_date'},
                                    'terms-1-term': {'any': [{'exists': False},
                                                             {'eq': ''}]},
                                    'classification-physics': {'any': [{'exists': False},
                                                                       {'eq': ''}]},
                                    'classification-quantitative_biology': {'any': [{'exists': False},
                                                                                    {'eq': ''}]},
                                    'classification-quantitative_finance': {'any': [{'exists': False},
                                                                                    {'eq': ''}]},
                                    'classification-statistics': {'any': [{'exists': False},
                                                                          {'eq': ''}]},
                                    'classification-economics': {'any': [{'exists': False},
                                                                         {'eq': ''}]},
                                    'classification-electrical_engineering_and_systems_science': {'any': [{'exists': False},
                                                                                                          {'eq': ''}]}}}},
            {'name': 'results_or_explicit_empty_result_loaded',
             'metric': 'url_pattern_match',
             'result': {'type': 'page_text'},
             'expected': {'type': 'const',
                          'value': ['(?:Search Results|Showing\\s+\\d|Sorry, your '
                                    'query|No results)',
                                    'reinforcement learning']}}]}

TASK = {'task_id': 'vts-048-arxiv-reinforcement-learning-cs-math-dates',
 'task_name': 'On arxiv.org, use Advanced Search to search all fields for '
              'reinforcement learning. Select both Computer Science and Mathematics, '
              'with no other subject areas, and filter by the most recent submission '
              'date from September 1, 2024 through January 31, 2025. Submit the search '
              'and leave the results page open.',
 'website': 'https://arxiv.org/'}
