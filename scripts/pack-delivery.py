"""Package the built site, standalone HTML and source project (stdlib only)."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'downloads'
OUT.mkdir(exist_ok=True)
assert (ROOT/'dist/index.html').is_file(), 'Run npm run build:portable first'
assert (ROOT/'portable/index.html').is_file(), 'Run npm run build:portable first'

def pack(name, files, prefix=''):
    target = OUT/name
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
        for file,relative in files:
            archive.write(file,prefix+str(relative))
        if name=='skit-offline.zip':
            archive.writestr('READ-ME.txt','СКТБ «СКиТ»\n\nРаспакуйте архив и откройте index.html в браузере.\nPython, Node.js и интернет не нужны. Всё встроено в один HTML.\n\nНа телефоне открывайте файл браузером: просмотрщик вложений может блокировать JavaScript.\nМеню открывается нативно; направления, контакты и все характеристики доступны без JavaScript.\nДля вращения объёмной модели нужны JavaScript и WebGL2.\n')
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None, name
    print(name,round(target.stat().st_size/1048576,2),'MB',flush=True)

for name,directory in [('skit-ready.zip','dist'),('skit-offline.zip','portable')]:
    base=ROOT/directory
    pack(name,((f,f.relative_to(base)) for f in sorted(base.rglob('*')) if f.is_file()))

files=[]
for name in ['.gitignore','README.md','design-qa.md','index.html','package.json','package-lock.json','vite.config.js']:
    files.append((ROOT/name,Path(name)))
for directory in ['src','public','scripts','model','docs']:
    for file in sorted((ROOT/directory).rglob('*')):
        if file.is_file() and not file.name.endswith('.blend1') and '__pycache__' not in file.parts:
            files.append((file,file.relative_to(ROOT)))
pack('skit-project.zip',files,'skit-project/')
