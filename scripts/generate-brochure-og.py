#!/usr/bin/env python3
"""Generate six first-party 1200x630 JPEG social cards. No external images or trademarks.
Pillow and locally available DejaVu fonts only. Deterministic and safe for CI."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SIZE=(1200,630)
S=2
OUT=Path("v2/assets")
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
ITEMS=[
 ("szkody-gornicze",("SZKODY","GÓRNICZE"),"Zdjęcia • dokumenty • zgłoszenie",(184,54,59),"house"),
 ("swiadczenie-wspierajace",("ŚWIADCZENIE","WSPIERAJĄCE"),"WZON • ZUS • codzienne wsparcie",(27,117,153),"support"),
 ("renty-powypadkowe",("RENTY","POWYPADKOWE"),"Wypadek • koszty • rozliczenia",(35,135,114),"rents"),
 ("skd",("SANKCJA KREDYTU","DARMOWEGO"),"Umowa • harmonogram • spłaty",(172,113,40),"skd"),
 ("kredyty-frankowe",("KREDYTY","FRANKOWE"),"Umowa CHF • spłaty • aneksy",(113,90,157),"franks"),
 ("sluzebnosc-przesylu",("SŁUŻEBNOŚĆ","PRZESYŁU"),"Działka • mapy • urządzenia",(40,115,135),"utility")
]
def font(size,bold=False):return ImageFont.truetype(BOLD if bold else REG,int(size*S))
def box(d,xy,rad,fill=None,outline=None,width=1):
 d.rounded_rectangle(tuple(round(x*S) for x in xy),radius=round(rad*S),fill=fill,outline=outline,width=round(width*S))
def line(d,points,color,width=1):
 d.line([(round(x*S),round(y*S)) for x,y in points],fill=color,width=round(width*S),joint="curve")
def circle(d,xy,fill=None,outline=None,width=1):
 d.ellipse(tuple(round(x*S) for x in xy),fill=fill,outline=outline,width=round(width*S))
def text(d,xy,value,size,color,bold=False):
 f=font(size,bold)
 d.text((round(xy[0]*S),round(xy[1]*S)),value,fill=color,font=f)
 return d.textbbox((0,0),value,font=f)[2]/S
def emblem(d,kind,accent):
 c=(244,230,207);soft=(215,206,192);x,y=885,150
 if kind=="house":
  line(d,[(x+45,y+140),(x+174,y+25),(x+301,y+140)],c,11)
  line(d,[(x+83,y+109),(x+83,y+269),(x+262,y+269),(x+262,y+109)],c,10)
  box(d,(x+132,y+164,x+191,y+269),5,None,c,6)
  line(d,[(x+194,y+110),(x+174,y+147),(x+203,y+179),(x+176,y+207),(x+201,y+244)],accent,10)
 elif kind=="support":
  circle(d,(x+140,y+24,x+202,y+86),outline=c,width=10)
  line(d,[(x+173,y+105),(x+173,y+208)],c,13)
  line(d,[(x+108,y+142),(x+173,y+207),(x+241,y+142)],c,12)
  line(d,[(x+83,y+245),(x+173,y+284),(x+265,y+245)],soft,11)
  for xx in (x+90,x+226):circle(d,(xx,y+80,xx+34,y+114),outline=accent,width=8)
 elif kind=="rents":
  for xx,top in ((60,218),(143,170),(227,112)):
   box(d,(x+xx,y+top,x+xx+62,y+285),8,None,c,7)
  line(d,[(x+57,y+151),(x+156,y+106),(x+223,y+126),(x+302,y+37)],accent,12)
  line(d,[(x+262,y+37),(x+302,y+37),(x+302,y+77)],accent,12)
 elif kind=="skd":
  box(d,(x+88,y+30,x+270,y+285),15,None,c,9)
  for i in range(3):line(d,[(x+124,y+107+i*38),(x+231,y+107+i*38)],soft,8)
  circle(d,(x+170,y+210,x+271,y+307),fill=accent,outline=c,width=6)
  line(d,[(x+195,y+260),(x+213,y+278),(x+244,y+240)],c,9)
 elif kind=="franks":
  line(d,[(x+55,y+104),(x+171,y+35),(x+287,y+104)],c,11)
  line(d,[(x+75,y+122),(x+270,y+122)],c,9)
  for xx in (x+101,x+170,x+239):line(d,[(xx,y+144),(xx,y+248)],c,14)
  line(d,[(x+75,y+268),(x+270,y+268)],c,10)
  text(d,(x+115,y+160),"CHF",31,accent,True)
 else:
  line(d,[(x+172,y+31),(x+172,y+295)],c,12)
  line(d,[(x+80,y+97),(x+266,y+97)],c,12)
  line(d,[(x+110,y+169),(x+234,y+169)],c,9)
  for xx in (x+75,x+248):circle(d,(xx,y+79,xx+29,y+111),outline=soft,width=7)
  line(d,[(x+104,y+95),(x+140,y+134),(x+172,y+95),(x+204,y+134),(x+249,y+95)],accent,7)

def generate(item):
 key,headings,subtitle,accent,icon=item
 W,H=SIZE[0]*S,SIZE[1]*S
 img=Image.new("RGB",(W,H))
 px=img.load()
 for y in range(H):
  yf=y/H
  for x in range(W):
   xf=x/W
   glow=max(0,1-math.hypot(xf-.84,(yf-.42)*.85)*1.72)
   px[x,y]=(int(17+9*yf+glow*(accent[0]-16)*.25),
             int(32+11*yf+glow*(accent[1]-30)*.25),
             int(43+15*yf+glow*(accent[2]-42)*.25))
 d=ImageDraw.Draw(img)
 for n in range(10):
  x=730+n*44
  line(d,[(x,-45),(x+200,520)],(42,61,71),2)
 box(d,(43,46,803,555),22,(22,38,49),(126,108,77),2)
 box(d,(59,62,787,539),15,(20,36,47),(67,75,75),1)
 box(d,(59,62,77,538),2,accent)
 box(d,(96,86,330,129),11,accent)
 text(d,(111,92),"MATERIAŁ DLA KLIENTA",14,(255,255,255),True)
 text(d,(96,152),"TWOJA SPRAWA",28,(240,223,179),True)
 line(d,[(97,205),(735,205)],(161,131,81),3)
 size=45 if key=="skd" else (46 if key in ("swiadczenie-wspierajace","sluzebnosc-przesylu") else 50)
 for i,heading in enumerate(headings):
  assert text(d,(96,232+i*71),heading,size,(255,255,255),True)<=640,heading
 text(d,(97,395),subtitle,23,(239,231,210))
 box(d,(96,460,709,504),8,(45,63,73))
 text(d,(111,467),"POBIERZ   •   WYDRUKUJ   •   UDOSTĘPNIJ",18,(251,242,224),True)
 circle(d,(850,138,1198,488),fill=(30,47,58),outline=(179,141,88),width=3)
 circle(d,(859,147,1189,479),fill=(33,50,62),outline=accent,width=4)
 emblem(d,icon,accent)
 box(d,(813,516,1173,558),9,accent)
 text(d,(849,525),"BEZPŁATNA BROSZURA A4",16,(255,255,255),True)
 line(d,[(47,585),(1153,585)],(139,115,72),2)
 text(d,(49,593),"SuccessTree • współpraca agencyjna z VOTUM",13,(213,207,191))
 text(d,(857,593),"twoja-sprawa.pages.dev",13,(213,207,191))
 img=img.resize(SIZE,Image.Resampling.LANCZOS)
 dest=OUT/("og-broszura-"+key+".jpg")
 dest.parent.mkdir(parents=True,exist_ok=True)
 img.save(dest,"JPEG",quality=87,optimize=True,progressive=True,subsampling=0)
 with Image.open(dest) as check:assert check.format=="JPEG" and check.size==SIZE
 assert 15_000<dest.stat().st_size<400_000,(dest,dest.stat().st_size)
 print("OG_BROCHURE_CREATED",dest,dest.stat().st_size)

if __name__=="__main__":
 for entry in ITEMS:generate(entry)
