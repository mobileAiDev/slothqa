"""Render an explicitly labelled trace replay. Requires Pillow and ffmpeg."""
import json, pathlib, subprocess, textwrap, argparse
from PIL import Image, ImageDraw, ImageFont

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'demo'
OUT.mkdir(exist_ok=True)
FONT=next((p for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/System/Library/Fonts/Supplemental/Arial.ttf','C:/Windows/Fonts/arial.ttf'] if pathlib.Path(p).exists()),None)
def font(n): return ImageFont.truetype(FONT,n) if FONT else ImageFont.load_default()
def wrapped(draw,xy,text,size=24,width=46,color='#dbe8df'):
    x,y=xy
    for line in textwrap.wrap(str(text),width):
        draw.text((x,y),line,font=font(size),fill=color);y+=size*1.4
    return y
frames=[]
def canvas(title,subtitle):
    im=Image.new('RGB',(1280,720),'#111b19');d=ImageDraw.Draw(im)
    d.text((55,35),'SLOTHQA  /  EXECUTION REPLAY',font=font(17),fill='#bbe38a')
    d.rounded_rectangle((770,24,1225,72),radius=12,fill='#294536')
    d.text((788,39),'REAL LOCAL MODEL  |  SIMULATED DEVICE',font=font(16),fill='#e3f4cf')
    d.text((55,100),title,font=font(45),fill='#f0f4ec')
    wrapped(d,(55,165),subtitle,21,85,'#a9c0b2')
    d.text((55,676),'Reconstructed from saved traces. Not an Android screen recording.',font=font(17),fill='#a9c0b2')
    return im,d
def save(im,seconds):
    p=OUT/f'frame-{len(frames):02}.png';im.save(p);frames.append((p,seconds))
im,d=canvas('Less tapping. More proof.','Qwen2.5 1.5B + AI App Bridge 0.4.19 + independent outcome assertions')
wrapped(d,(55,270),'Goal: Create a task called “Slow and Steady” and verify it appears in the list.',34,48)
wrapped(d,(55,440),'Three live-inference runs. No fixed action sequence. No physical-device claim.',27,61)
save(im,6)
names={'normal':'01 / Normal flow','changed':'02 / Changed UI + confirmation','broken-save':'03 / Broken save'}
for variant in names:
    rows=[json.loads(l) for l in (ROOT/f'evidence/bridge-{variant}/trace.jsonl').read_text().splitlines()]
    obs=[e for e in rows if e['type']=='observation']
    final=[e for e in rows if e['type']=='verdict'][-1]
    for o in obs:
        m=next((e for e in rows if e['type']=='model' and e['revision']==o['revision']),None)
        dec=next((e for e in rows if e['type']=='decision' and e['revision']==o['revision']),None)
        im,d=canvas(names[variant],f'Observation {o["revision"]}  /  independent decisions from the current screen')
        if dec:
            a=dec['decision']['action'];action=a['action']+' '+a['selector'].get('resourceName','').split('/')[-1]
            if 'value' in a:action+=' = '+a['value']
            wrapped(d,(55,270),action,29,36,'#c8ef9c')
            wrapped(d,(55,365),m['parsed']['reason'] if m else '',23,43)
            d.text((55,595),f'Local inference: {m["latencyMs"]/1000:.2f}s' if m else '',font=font(21),fill='#a9c0b2')
        else:
            wrapped(d,(55,270),'VERIFIED PASS' if final['verdict']=='complete' else 'INCONCLUSIVE — NO PASS',32,35,'#c8ef9c' if final['verdict']=='complete' else '#ffd69c')
            wrapped(d,(55,370),final['reason'],26,38)
        d.rounded_rectangle((835,233,1210,642),radius=28,fill='#edf0e5',outline='#829e89',width=5)
        y=260
        for n in o['summary']['nodes']:
            t=n.get('text') or n.get('label') or ''
            if not t:continue
            role=n.get('role')
            if role in ['input','button']:
                d.rounded_rectangle((857,y,1188,y+54),radius=10,fill='#2d573e' if role=='button' else '#d8e2d4')
                color='#ffffff' if role=='button' else '#263e2f'
                wrapped(d,(871,y+13),t,18,30,color);y+=68
            else:y=wrapped(d,(857,y+5),t,19,29,'#263e2f')+14
        save(im,4 if dec else 6)
im,d=canvas('Keep the limitations visible.','The model proposes actions. The verifier owns the result.')
for j,t in enumerate(['15 tests passed, including the Bridge Intent contract.','Normal + changed UI passed; broken save stayed inconclusive.','Android sample included. Physical-device verification still pending.','Early model failures and all final raw traces are included.']):wrapped(d,(55,265+j*78),t,25,85)
save(im,7)
with open(OUT/'frames.txt','w') as f:
    for p,seconds in frames:f.write(f"file '{p.name}'\nduration {seconds}\n")
    f.write(f"file '{frames[-1][0].name}'\n")
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','frames.txt','-vf','fps=24','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','slothqa-demo.mp4'],cwd=OUT,check=True)
print(OUT/'slothqa-demo.mp4')
