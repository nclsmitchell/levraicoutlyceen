import sys,unittest,json,hashlib,tempfile
from pathlib import Path
from decimal import Decimal as D
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from domain import *
from collect import ROOT,decode,digest

def obs(event,amount,nature='payment_net',**kwargs):return Observation(event,D(str(amount)),nature,evidence=kwargs.pop('evidence','official-document#row1'),transformation=kwargs.pop('transformation','qualified-final-payment-v1'),**kwargs)
class BusinessRules(unittest.TestCase):
 def test_01_transfer_and_final_purchase(self):self.assertEqual(consolidate([obs('grant',100,'transfer'),obs('purchase',80)]),D(80))
 def test_02_replacement_already_in_payroll(self):self.assertEqual(consolidate([obs('payroll',1000),obs('replacement',100,included_in='payroll')]),D(1000))
 def test_03_AP_contract_annual_payments(self):
  rows=[obs('AP',10000000,'authorization'),obs('contract',8000000,'contract'),obs('p1',1000000,year=2023),obs('p2',2000000,year=2024)]
  self.assertEqual(consolidate([r for r in rows if r.year==2023]),D(1000000));self.assertEqual(consolidate([r for r in rows if r.year==2024]),D(2000000));self.assertEqual(consolidate(rows),D(3000000))
 def test_04_acquisition_depreciation_not_added(self):self.assertEqual(consolidate([obs('asset',1000),obs('depreciation',100,'depreciation')],economic=True),D(100))
 def test_05_weighted_territory(self):self.assertEqual(territorial([(100*10000,100),(900*20000,900)])['ratio'],D(19000))
 def test_06_average_convention(self):self.assertEqual(average(600,900),D(700));self.assertIsNone(average(None,900));self.assertIsNone(average(600,900,False))
 def test_07_post_bac_mismatch(self):self.assertIsNone(ratio(1000,100,'all_including_post_bac','pre_bac'))
 def test_08_allocation_residual(self):
  self.assertEqual(allocate(100,[60,30]),D(10))
  with self.assertRaises(ValueError):allocate(100,[60,50])
 def test_09_states_distinct(self):self.assertEqual(len({display_state(0,'observed'),display_state(None,'missing'),display_state(None,'suppressed'),display_state(None,'not_applicable')}),4)
 def test_10_attached_unit(self):self.assertEqual(independent_entities([{'uai':'a','category':'principal'},{'uai':'b','category':'section','parent':'a'},{'uai':'a','category':'principal'}]),{'a'})
 def test_11_immutable_version_key(self):
  self.assertEqual(digest(b'official CSV v1'),digest(b'official CSV v1'));self.assertNotEqual(digest(b'official CSV v1'),digest(b'official CSV v2'))
 def test_12_partial_panel(self):
  r=territorial([(1000,100),(2000,100),(3000,100),(None,100),(None,100)])
  self.assertEqual(r['ratio'],D(20));self.assertEqual(r['covered'],3);self.assertEqual(r['total'],5);self.assertEqual(r['status'],'partial')
 def test_13_units_and_tax(self):
  with self.assertRaises(ValueError):consolidate([obs('a',100,tax='HT'),obs('b',100,tax='TTC')])
  with self.assertRaises(ValueError):consolidate([obs('a',100,unit='kEUR')])
 def test_14_evidence_required(self):
  with self.assertRaises(ValueError):consolidate([obs('a',100,transformation='')])
 def test_15_agent_advance_not_final(self):self.assertEqual(consolidate([obs('advance',100,final=False),obs('final-payment',80)]),D(80))
 def test_16_voted_never_executed(self):self.assertIsNone(consolidate([obs('vote',100,'authorization')]))
 def test_17_planned_never_actual(self):self.assertEqual(milestone_label(False),'Prévu');self.assertEqual(milestone_label(True),'Réalisé')
 def test_18_missing_not_good_conditions(self):self.assertEqual(condition_label(None),'Non documenté')
 def test_zero_denominator_and_missing(self):self.assertIsNone(ratio(100,0,'pre_bac','pre_bac'));self.assertIsNone(ratio(None,100,'pre_bac','pre_bac'))
 def test_refund_sign(self):self.assertEqual(consolidate([obs('paid',100),obs('refund',-20)]),D(80))
 def test_normalizations(self):self.assertEqual(year('2025-01-01T00:00:00Z'),2025);self.assertEqual(department('093'),'93')
 def test_mandate_is_not_payment(self):self.assertIsNone(consolidate([obs('mandate',100,'mandate_net')]));self.assertEqual(consolidate([obs('mandate',100,'mandate_net')],basis='mandate_net'),D(100))

class RealDataAudit(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.data=json.loads((ROOT/'data/derived/current.json').read_text())
 def test_every_source_hash(self):
  for s in self.data['sources']:
   self.assertEqual(digest((ROOT/s['path']).read_bytes()),s['sha256'])
 def test_every_observation_has_trace(self):
  ids={e['id'] for e in self.data['evidence']};versions={(s['id'],s['sha256']) for s in self.data['sources']}
  for r in self.data['enrollments']+self.data['financial']:self.assertIn(r['evidence'],ids)
  for e in self.data['evidence']:self.assertIn((e['source'],e['version']),versions);self.assertTrue(e['rule']);self.assertTrue(e['column'])
 def test_no_duplicate_observations(self):
  for key in ['enrollments','financial','evidence']:self.assertEqual(len(self.data[key]),len({r['id'] for r in self.data[key]}))
 def test_exports_complete(self):
  for s in self.data['sources']:
   if s['mode']=='full':self.assertEqual(s['row_count'],s['expected_count'])
 def test_no_false_execution_or_conditions(self):
  self.assertTrue(all(r['nature'] in {'authorization','proposed_budget'} for r in self.data['financial']));self.assertTrue(all(r['executed']=='missing' and r['conditions']=='missing' for r in self.data['summary']))
 def test_all_years(self):self.assertEqual({r['year'] for r in self.data['enrollments']},set(range(2019,2026)))
 def test_Paris_official_codes(self):
  for e in self.data['establishments']:
   if e['department']=='75':self.assertEqual(e['commune'],'75056');self.assertTrue(e['arrondissement'] is None or e['arrondissement'].startswith('751'))
 def test_normandy_not_loaded(self):self.assertFalse(any(e['source'].startswith('fr-en-normandie') for e in self.data['evidence']))
 def test_idempotent_recalculation(self):
  from ingest import build
  from contextlib import redirect_stdout
  import io
  with redirect_stdout(io.StringIO()):first=build();second=build()
  self.assertEqual(first,second)
 def test_pdf_control_totals(self):
  path=ROOT/'data/reports/pdf-controls.json'
  self.assertTrue(path.exists());self.assertTrue(all(r['passed'] for r in json.loads(path.read_text())))
if __name__=='__main__':unittest.main()
