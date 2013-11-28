%{
        /*  Deutsch nach Schwaebisch Uebersetzer
            To compile: lex schwob.x
                        cc -o schwob lex.yy.c -ll
            und schwob ist das binary. Pfeift Eure schoensten Texte durch !

            rza@aifb.uni-karlsruhe.de       bzw.
            zabka@infpav4.kfk.de       (  Ralf Zabka  )   
            
	    ---
	    Die Adresse stimmt nicht mehr, zur Zeit (Ende 1997)
	    ist sie Ralf_Zabka@HP-Sweden-om2.om.hp.com.

	    webschwob unterscheidet sich vom originalen schwob
	    nur durch das erste Pattern.  Verantwortlich dafuer
	    ist Markus Demleitner (msdemlei@mathi.uni-heidelberg.de).
	    Ausserdem: Kompilation auf GNU-basierten Systemen mit
	       flex webschwob.lex;gcc -o webschwob lex.yy.c -lfl

	          Demi
        */
%}
end 	[ \.,!\?\)\(\n]
%%
\<[^>]*\> ECHO;
"&".[^[:space:];]*";" ECHO;
Wochen printf("Woche");
" ge"/[d-gk] printf(" ");
" ge"/[^"be"h"rn"] printf(" g");
"Ein"		printf("Oi");
" eines "  printf(" von a ");
" dieser " printf(" von dene ");
" des "    printf(" vom ");
" diesem " printf(" dem ");
" richtig" printf(" recht");
" heb"/("t"|"en") printf(" lupf");
" halten " printf(" heben ");
" etwas"/{end} printf(" ebbes");
" auch"/{end}  printf(" au");
" n"[ao]"ch " printf(" no ");
" Guten Tag " printf(" Gruess Gott ");
"hat"      printf("hedd");
"habe"n?   printf("hend");
"ein"e?    printf("oi");
"en Sie"   printf("et Sie");
"jenige"[rsmn]? ;
"welche"[rsmn]? printf("wo");
[Ww]"essen"   printf("%cem sai",yytext[0]);
"he"?"runter" printf("raa");
"hin"("ab"|"unter") printf("naa");
("he"?|"hi")[nr]"auf" printf("%cuff",yytext[2]);
[Dd]"as"     printf("%ces",yytext[0]);
da?"ran"   printf("dro");
" d"[ae]"nn" printf(" noh");
" den"     printf(" den");
" nein"    printf(" hanoi");
" sehr"/{end} printf(" saum‰ﬂich");
"nicht mehr"  printf("nemme");
" die"/{end}  printf(" d");
[Nn]"ichts"/{end}  printf("%cix",yytext[0]);
[Nn]"icht"    printf("%cedd",yytext[0]);
"tiell"    printf("ziell");
"tion"     printf("zion");
"ach"      printf("ach");
"einge"	printf("oig");
"ange"	printf("og");
"uch"      printf("uch");
"au"       printf("au");
"ck"       printf("gg");
"eu"       printf("ei");
"ie"/(b|"hs") printf("ia");
"ja"       printf("joo");
"ph"       printf("f");
[Ss]p      printf("%cchb",yytext[0]);
[Tt]h      printf("%ch",yytext[0]);
"ut"/t?e   printf("uad");
"zu"/[^bdegl-prtz] printf("z");
"p"        printf("b");
"t"        printf("d");
"auchen$"/{end}	printf("auche");
"sschen"/{end} printf("ssle");
"schen"/{end} printf("sche");
"chen"/{end}  printf("le");
" "[Ww]"ir"/{end} {yytext[1]-=10; printf(" %cir",yytext[1]);}
"ern"/{end} printf("eret");
[ DMSdms]"ich"/{end} printf("%ci",yytext[0]);
"mal"/{end} printf("mol");
"on"/{end}  printf("o");
"ig"/{end}  printf("ich");
[bd-gmk]e/{end}  printf("%c",yytext[0]);
"pe"/{end}  printf("b");
e[lrs]/{end}  printf("%c",yytext[1]);
("st "[Dd]u|"st")/{end} printf("sch");
"en"/{end}  printf("e");
[Ss]t       printf("%cchd",yytext[0]);
"!"         printf(", hajo, so isch des !");
%%


