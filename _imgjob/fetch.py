import json,urllib.request,urllib.parse,os,time
UA={'User-Agent':'InvitelyImgJob/1.0 (contact: site owner)'}
def get(u):
    r=urllib.request.Request(u,headers=UA)
    return urllib.request.urlopen(r,timeout=30).read()
Q=json.load(open('_imgjob/q.json'))
os.makedirs('_cand',exist_ok=True)
meta={}
for slug,qs in Q.items():
    n=0
    for q in qs:
        # openverse
        try:
            u='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'license_type':'commercial,modification','category':'photograph','mature':'false','page_size':8})
            res=json.loads(get(u))['results']
            for it in res:
                try:
                    b=get(it['thumbnail'])
                    fn=f'{slug}_{n:02d}.jpg';open('_cand/'+fn,'wb').write(b)
                    meta[fn]={'src':'openverse','q':q,'title':it.get('title'),'creator':it.get('creator'),'license':it.get('license'),'lv':it.get('license_version'),'page':it.get('foreign_landing_url'),'url':it.get('url')};n+=1
                except Exception as e: print('x',e)
                time.sleep(0.3)
        except Exception as e: print('ov',slug,q,e)
        # commons
        try:
            u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','generator':'search','gsrsearch':q+' filetype:bitmap','gsrnamespace':6,'gsrlimit':6,'prop':'imageinfo','iiprop':'url|extmetadata','iiextmetadatafilter':'LicenseShortName|Artist','iiurlwidth':500,'format':'json'})
            pages=json.loads(get(u)).get('query',{}).get('pages',{})
            for p in pages.values():
                ii=p['imageinfo'][0]
                try:
                    b=get(ii['thumburl'])
                    fn=f'{slug}_{n:02d}.jpg';open('_cand/'+fn,'wb').write(b)
                    em=ii.get('extmetadata',{})
                    meta[fn]={'src':'commons','q':q,'title':p['title'],'license':em.get('LicenseShortName',{}).get('value'),'creator':em.get('Artist',{}).get('value'),'page':ii['descriptionurl'],'url':ii['url']};n+=1
                except Exception as e: print('x',e)
                time.sleep(0.3)
        except Exception as e: print('cm',slug,q,e)
    print(slug,n)
json.dump(meta,open('_cand/meta.json','w'),indent=1)
