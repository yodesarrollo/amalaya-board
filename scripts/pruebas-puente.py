import importlib.util,unittest
import contextlib,io,json
from unittest.mock import patch
from pathlib import Path
spec=importlib.util.spec_from_file_location('bridge',Path(__file__).with_name('conciliar-chinches.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class BridgeTests(unittest.TestCase):
    def test_ephemeral_token_transport_not_logged(self):
        url='https://github.com/yodesarrollo/amalaya-board/issues/123'
        pin={'id':'CHN-DEMO-1','estado':'tomada','issue':url}
        closed={'number':123,'html_url':url,'body':'# Chinche CHN-DEMO-1','state':'closed','state_reason':'completed'}
        token='fixture-read-only-token-for-GitHub';key='fixture-bridge-key';calls=[]
        def fake(request):
            calls.append(request)
            if request.full_url.startswith('https://api.github.com/'):
                self.assertEqual(request.full_url,'https://api.github.com/repos/yodesarrollo/amalaya-board/issues/123')
                self.assertEqual(request.get_header('Authorization'),'Bearer '+token)
                return closed
            if request.data is None:return {'ok':True,'chinches':[pin]}
            body=json.loads(request.data);self.assertEqual(body['github_token'],token);self.assertEqual(body['k'],key)
            return {'ok':True,'id':pin['id'],'estado':'terminada','evidencia':{'issue':url,'motivo':'completed'}}
        output=io.StringIO()
        with patch.dict(m.os.environ,{'GH_TOKEN':token,'K':key}),patch.object(m,'request_json',fake),patch.object(m.sys,'argv',['fixture']),contextlib.redirect_stdout(output):m.main()
        self.assertEqual(len(calls),3);self.assertNotIn(token,output.getvalue());self.assertNotIn(key,output.getvalue())
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
    def test_uuid_pin_from_seguimiento_3d(self):
        url='https://github.com/yodesarrollo/amalaya-board/issues/123';uuid='e22cc5ad-5769-429c-9c6d-ddff44c56a7f'
        pin={'id':uuid,'estado':'tomada','issue':url}
        closed={'number':123,'html_url':url,'body':'# Chinche '+uuid,'state':'closed','state_reason':'completed'}
        plan=list(m.candidates([pin],lambda _:closed))
        self.assertEqual(plan,[{'action':'chincheEstado','id':uuid,'issue':url,'estado_previo':'tomada','estado':'terminada','motivo':'completed'}])
        with self.assertRaises(ValueError):list(m.candidates([pin],lambda _:{**closed,'body':'# Chinche CHN-DEMO-1'}))
if __name__=='__main__':unittest.main()
