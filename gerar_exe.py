import os
import PyInstaller.__main__

assets = ['logo_kts.jpeg']
for extra in ['header_kts.jpeg', 'footer_kts.jpeg']:
    if os.path.exists(extra):
        assets.append(extra)

args = ['app_kts.py.py', '--onefile', '--noconsole']
for asset in assets:
    args.append(f'--add-data={asset};.')

PyInstaller.__main__.run(args)