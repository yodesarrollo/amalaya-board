import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('bridge',Path(__file__).with_name('conciliar-chinches.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class BridgeTests(unittest.TestCase):
    def test_closed_and_open(self):
        url='https://github.com/yodesarrollo/amalaya-board/issues/123'
        pin={'id':'CHN-DEMO-1','estado':'tomada','issue':url}
        closed={'number':123,'html_url':url,'body':'# Chinche CHN-DEMO-1','state':'closed','state_reason':'completed'}
        self.assertEqual(list(m.candidates([pin],lambda _:closed))[0]['estado'],'terminada')
        self.assertEqual(list(m.candidates([pin],lambda _:{**closed,'state':'open'})),[])
        self.assertEqual(list(m.candidates([{**pin,'estado':'terminada'}],lambda _:self.fail('terminal pin fetched'))),[])
        for bad in [{**closed,'state_reason':None},{**closed,'body':'# Chinche CHN-DEMO-other'},{**closed,'pull_request':{'url':'fake'}}]:
            with self.assertRaises(ValueError):list(m.candidates([pin],lambda _:bad))
        with self.assertRaises(ValueError):list(m.candidates([{**pin,'issue':'https://github.com/other/repo/issues/123'}],lambda _:closed))
if __name__=='__main__':unittest.main()
