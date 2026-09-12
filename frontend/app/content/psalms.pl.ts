export interface Psalm {
  roman: string;
  label: string;
  verses: Record<string, string>;
}

export interface PsalmsResource {
  cover: {
    title: string;
    subtitle: string;
    author: string;
  };
  psalms: Record<string, Psalm>;
}

export const pl: PsalmsResource = {
  cover: {
    title: "Latopis Nechrubelski",
    subtitle: "Pisma Nienazwane.",
    author: "Spisane przez mnicha Anuka Schlegera.",
  },
  psalms: {
    "1": {
      roman: "I",
      label: "PSALM I",
      verses: {
        "1": "Miasto zostanie wypatroszone. Znikną z oczu ci, którzy spoczywają w pustce.",
        "2": "A ziemia zadrży i spęka cała. I z potrzaskanej skorupy uleci mgła morowa, co po dziesięciu dniach okryje świat.",
        "3": "Ci co budowali solidnie, kamień na kamieniu, tak też padną, a kamień na kamieniu po nich nie ostanie.",
        "4": "I otchłań zaświatów wypluje latające zjawy i monstra pełznące. Gdy one przeminą, czerw opłynie w tłuszcz, a sęp w marazm.",
        "5": "Ukoronowana zostanie wątpliwość. Lojalni zwrócą swe ostrza przeciw tym, którzy ofiarowali srebro.",
        "6": "A kaszel krwawy rozsieje się niczym na suszą spękanych pustkowiach pożoga.",
      },
    },
    "2": {
      roman: "II",
      label: "PSALM II",
      verses: {
        "1": "Tak na początku, jak i na końcu, powietrze gęste będzie od much i os maści wszelakiej.",
        "2": "A gleba zblednie od larw.",
        "3": "A z Włóczni: zamróz. Zawieje z Khryptonoszy i okryje wszystko.",
        "4": "A po dziesięciu i jednym dniu, jak powietrze, czarnoksięskie manuskrypty nikłe się staną.",
        "5": "A szkło w kwarc się przeistoczy.",
        "6": "A ONA ujrzy, jak ON rośnie w siłę. I ujawni się ONA, a wszyscy zostaną zgładzeni.",
      },
    },
    "3": {
      roman: "III",
      label: "PSALM III",
      verses: {
        "1": "W Graven-Tosku ziemia ogrzeje kurhany i powłóczą nogami ci spoczywający wiecznie.",
        "2": "W sercu Sarkashu zamglony zmierzch odetchnie pod rozbudzonymi pniami. To, co niegdyś rąbane z ludzkiej ręki było, rąbać zacznie w równej mierze.",
        "3": "I głód wkradnie się w progi. Wykopiecie korzenie i odciągnięcie niemowlęta od piersi. Zmarniali zapolują na wychudzonych.",
        "4": "Zamożni popadną w biedę, a biedacy jeszcze więcej stracą.",
        "5": "Wtedy nadejdzie deszcz bez końca i w jego cieniu dzień w noc się przeobrazi.",
        "6": "Brat uśmierci Brata, a Siostra Siostrę zatruje.",
      },
    },
    "4": {
      roman: "IV",
      label: "PSALM IV",
      verses: {
        "1": "Przez pięć dni i nocy pięć, ciało matki będzie opończą demonów.",
        "2": "A przez dni pięć i pięć nocy, ojcowie ronić będą łzy.",
        "3": "Spójrzcie na Zachód. Nadciągają pożoga i horda, a Królestwa w ogniu stają.",
        "4": "Kłamca Arkh zwiąże z ludzkich serc węzły, w pół łamiąc najsilniejsze więzi.",
        "5": "Ujrzyjcie Bezkresne Morze, gdzie Lewiatan podburza fale, by stały się górami.",
        "6": "I między was wkroczy ów Lewiatan. Skradnie zarówno dzieci w zimę urodzone jak i te, którym pisane przed śniegami zemrzeć.",
      },
    },
    "5": {
      roman: "V",
      label: "PSALM V",
      verses: {
        "1": "Jezioro wraz ze strumykiem sczernieją, wody w smołę przemienione.",
        "2": "Drzewa uschną i zginą skurczone.",
        "3": "A ptaki spadną z nieboskłonu, martwe.",
        "4": "Jednej nocy umrą wszyscy ci, co nie mają jeszcze siedmiu lat i siedmiu dni. Zrodzeni i nieurodzeni. I świt tchnie w nich nowe życie jako pożeraczy ludzi.",
        "5": "Niebiosa zapłaczą ogniem i ogromny głaz spadnie, niby miasto zrzucone z raju. Jego darem jest Śmierć, a zwiastunem – szaleństwo.",
        "6": "A ostatni Król i ostatnia Królowa w pył się obrócą. Wilki pożrą ich żałosne dwory.",
      },
    },
    "6": {
      roman: "VI",
      label: "PSALM VI",
      verses: {
        "1": "Wiedzcie, że ostatni dzień nadszedł. Słońce zajdzie i nigdy już nie zaświeci.",
        "2": "A dzień stanie się jak noc i noc jak dzień. Nie dane będzie wam spocząć, ni się zbudzić.",
        "3": "Anthelia dopełni swą wolę, spijając kolor ze wszystkich krain.",
        "4": "Ci, co na dwóch nogach kroczą, będą bez imienia, niby zwierzęta pól.",
        "5": "Grunt okryje się żyłami, wypełzną zeń czarne żmije.",
        "6": "A bezimienni zejdą pod ziemię i przekroczą Woal, bowiem rozbił go Daejmon, sierocy podwładny Nechrubela.",
      },
    },
    "7": {
      roman: "VII",
      label: "PSALM VII KOŃCZĄCY",
      verses: {
        "7": "Chwała Yetsabu-Nechowi, marze zaświatów, czarnemu dyskowi, który to przesłonił słońce! Chwała Verhu, który to z zachwytu zęby szczerzy! Chwała płomieniom, które to zwęglają wszystko! A ciemność ta pochłonie tę ciemność.",
      },
    },
  },
};
