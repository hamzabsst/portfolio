import subprocess,random,json,platform,sys
from pathlib import Path
root=Path(sys.argv[1]).resolve()
subprocess.run(['make','-s','-C',str(root),'all','bonus'],check=True)
rows=[]
for size in (5,100,500):
    values=list(range(size));random.Random(42).shuffle(values)
    result=subprocess.run([str(root/'push_swap'),*map(str,values)],capture_output=True,text=True,check=True,timeout=10)
    checked=subprocess.run([str(root/'checker'),*map(str,values)],input=result.stdout,capture_output=True,text=True,check=True,timeout=10)
    rows.append({'size':size,'operations':len(result.stdout.splitlines()),'checker':checked.stdout.strip(),'input':values})
assert all(row['checker']=='OK' for row in rows)
data={'commit':subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip(),'date':__import__('datetime').date.today().isoformat(),'platform':platform.system()+' '+platform.machine(),'compiler':subprocess.check_output(['cc','--version'],text=True).splitlines()[0],'flags':'-Wall -Werror -Wextra -g','method':'One shuffled permutation per size, Python Random(42); operation count, not elapsed time. Inputs are included for reproduction.','results':rows}
Path(__file__).resolve().parents[1].joinpath('assets/push-swap-benchmark.json').write_text(json.dumps(data,indent=2)+'\n')
print([(r['size'],r['operations'],r['checker']) for r in rows])
