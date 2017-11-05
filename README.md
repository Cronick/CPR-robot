## Introduktion
Det er efter dansk lovgivning strengt forbudt at slå andres CPR numre op, samt så er dette script forældet, så dette har ingen reel værdi.

## Nødvendige programmer
- Python
- PhantomJS
- CasperJS

## Opsætning
1. Login med NemID på tinglysning.dk
2. Tryk på "Opret digital fuldmagt" i menuen i toppen.
3. Tryk på "Tingbogen"
4. Kopier linket på den side du er på, og skulle gerne ligne det link som også er angivet som eksempel i programmet.
https://www.tinglysning.dk/tinglysning/fuldmagt/opretfuldmagt.xhtml?_afPfm=-XXXXXXXXX

Efter dette skulle man finde en cookie i sin browser ved navnet "TDK_JSESSIONID" og indsætte linket og indholdet fra cookien i scriptet.
Derved er det bare kører scriptet med "casperjs Tinglysning-nemid.js" i sin terminal/command prompt eller hvad man nu bruger.

## Relevant information
- https://www.version2.dk/artikel/cpr-soeren-idoemt-boede-vise-ministres-cpr-numre-56221 - [@sqren](https://github.com/sqren)
- https://www.radio24syv.dk/dig-og-radio24syv/cpr-robotten/ (https://www.youtube.com/watch?v=vI_LvK9vi4U)
- https://www.version2.dk/artikel/tinglysning-hjemmeside-afsloerer-stadig-folks-cpr-numre-67502
- https://www.business.dk/digital/tinglysning-opruster-med-nemid-for-at-beskytte-mod-cpr-hack