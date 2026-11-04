from pathlib import Path
from core.evaluator import score_evidence


def evaluate_report_date(evidence, record, task_dir):
    return score_evidence(
        SPEC, evidence=evidence, record=record,
        task=TASK, task_dir=Path(task_dir),
    )


# Complete original evaluator specification.
SPEC = {'spec_version': '1',
 'conj': 'and',
 'checks': [{'name': 'report_publication_date',
             'metric': 'answer_match',
             'result': {'type': 'agent_answer'},
             'expected': {'type': 'const',
                          'value': {'.': {'re': '(?<![0-9])(?:18(?:th)?[\\s,./-]+(?:of\\s+)?Mar(?:ch)?\\.?[\\s,./-]+2025|Mar(?:ch)?\\.?[\\s,./-]+18(?:th)?[\\s,./-]+2025|2025[-/.]0?3[-/.]18|18[-/.]0?3[-/.]2025|0?3[-/.]18[-/.]2025|2025\\s*年\\s*0?3\\s*月\\s*18\\s*日)(?![0-9])',
                                          'flags': 'I'}}}}]}

TASK = {'task_id': 'vts-083-webgym-300019',
 'task_name': "Find the date of Reach plc's 2024 Annual Report & Accounts publication.",
 'website': 'https://www.trinitymirror.com'}
