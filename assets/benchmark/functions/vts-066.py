from pathlib import Path
from core.evaluator import score_evidence


def evaluate_complex_number(evidence, record, task_dir):
    return score_evidence(
        SPEC, evidence=evidence, record=record,
        task=TASK, task_dir=Path(task_dir),
    )


# Complete original evaluator specification.
SPEC = {'spec_version': '1',
 'conj': 'and',
 'checks': [{'name': 'evaluated_complex_value',
             'metric': 'math_value_match',
             'result': {'type': 'agent_answer'},
             'expected': {'type': 'const', 'value': [0.71718257, -0.4252584]},
             'options': {'tol': 2e-06,
                         'complex_required': True,
                         'exclude_expressions': ['(1+0.1*i)^8+(1-0.2*i)^8',
                                                 '(1+0.1i)^8+(1-0.2i)^8']}},
            {'name': 'wolframalpha_calculated_result_seen',
             'metric': 'history_presence_match',
             'result': {'type': 'snapshot_history',
                        'url_pattern': '^https://(?:www\\.)?wolframalpha\\.com(?:/|$)',
                        'all_tabs': True,
                        'expression': '(() => {\n'
                                      ' const '
                                      "numeric='[+-]?(?:\\\\d+(?:\\\\.\\\\d+)?|\\\\.\\\\d+)(?:[eE][+-]?\\\\d+)?';\n"
                                      ' const re=new '
                                      "RegExp('('+numeric+')(?:\\\\.{3}|…)?\\\\s*([+\\\\-])\\\\s*('+numeric+')(?:\\\\.{3}|…)?\\\\s*\\\\*?\\\\s*[ij]\\\\b','i');\n"
                                      ' const '
                                      "complex_images=Array.from(document.querySelectorAll('img[alt]')).map(img=>{\n"
                                      "  const alt=img.getAttribute('alt')||'';\n"
                                      '  const '
                                      "normalized=alt.replace(/−/g,'-').replace(/\\\\n/g,' "
                                      "').replace(/\\s+/g,' ');\n"
                                      '  const m=normalized.match(re);\n'
                                      '  if(!m) return null;\n'
                                      '  return '
                                      "{alt,real:Number(m[1]),imag:(m[2]==='-'?-1:1)*Number(m[3]),source_url:location.href,rendered:img.getClientRects().length>0};\n"
                                      ' }).filter(Boolean);\n'
                                      ' return '
                                      "{body_present:document.body?'body':null,complex_images};\n"
                                      '})()',
                        'must_exist': ['body_present']},
             'expected': {'type': 'const',
                          'value': {'path': 'snapshots[*].pages[*].facts.complex_images[*]',
                                    'rules': {'real': {'approx': 0.71718257,
                                                       'tol': 2e-06},
                                              'imag': {'approx': -0.4252584,
                                                       'tol': 2e-06},
                                              'source_url': {'re': '^https://(?:www\\.)?wolframalpha\\.com(?:/|$)'},
                                              'rendered': True},
                                    'spec_version': 1}}}]}

TASK = {'task_id': 'vts-066-webvoyager-wolfram-alpha-21',
 'task_name': 'Calculate (1+0.1*i)^8 + (1−0.2*i)^8  where i is a complex number. Use '
              'wolframalpha.com as the source.',
 'website': 'https://www.wolframalpha.com/'}
