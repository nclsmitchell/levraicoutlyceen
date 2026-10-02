import unittest,sys,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from admin_import import validate
from collect import digest
class HumanMapping(unittest.TestCase):
 def setUp(self):
  self.mapping={'columns':{'uai':'UAI','year':'year','amount':'amount'},'constants':{'nature':'mandate_net','population':'all_users','unit':'EUR','currency':'EUR','tax':'TTC','quality':'observed','post':'energy'}}
  self.rows=[{'UAI':'0930125F','year':2025,'amount':'100,50'}];self.sha='0'*64
  self.approval={'source_sha256':self.sha,'mapping_sha256':digest(json.dumps(self.mapping,sort_keys=True,ensure_ascii=False).encode()),'reviewer':'TEST ONLY','approved_at':'2026-10-02'}
 def test_missing_human_approval_rejected(self):
  with self.assertRaises(ValueError):validate(self.rows,self.mapping,self.sha,{})
 def test_mutated_mapping_rejected(self):
  self.mapping['constants']['nature']='payment_net'
  with self.assertRaises(ValueError):validate(self.rows,self.mapping,self.sha,self.approval)
 def test_exact_amount_private_bundle_and_blocked_ratio(self):
  r=validate(self.rows,self.mapping,self.sha,self.approval);self.assertEqual(r['observations'][0]['amount'],'100.50');self.assertEqual(r['publication'],'not_published');self.assertEqual(r['original_visibility'],'private');self.assertTrue(r['observations'][0]['ratio_eligibility'].startswith('blocked'))
 def test_unit_invalid_in_quarantine(self):
  self.mapping['constants']['unit']='kEUR';self.approval['mapping_sha256']=digest(json.dumps(self.mapping,sort_keys=True,ensure_ascii=False).encode());r=validate(self.rows,self.mapping,self.sha,self.approval);self.assertEqual(len(r['quarantine']),1);self.assertEqual(len(r['observations']),0)
