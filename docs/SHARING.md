# Udostępnianie psalmów

## Co trzeba skonfigurować

Nie są potrzebne konta deweloperskie, boty ani klucze API dla WhatsAppa, Facebooka, X, poczty lub Discorda.

Przed wdrożeniem sprawdź tylko:

1. `AUTH_BASE_URL` wskazuje publiczny adres HTTPS aplikacji, bez końcowego ukośnika. Pipeline przekazuje go do frontendu jako `VITE_PUBLIC_ORIGIN`, aby prerenderowane metadane zawierały publiczne adresy.
2. Publiczne strony `/{locale}/psalm/{num}` są dostępne dla robotów generujących podgląd linku. Nie blokuj `Discordbot` ani robotów Facebooka na Cloudflare.
3. Po wdrożeniu wklej przykładowy link na Discordzie i sprawdź tytuł oraz opis podglądu.

## Zachowanie aplikacji

Przycisk `Udostępnij` tworzy adres w postaci:

```text
/{locale}/psalm/{num}?v={verse}&origin=share
```

Adres zachowuje wyróżniony werset, ale nie zawiera parametru `r`, ponieważ kolejność odkrywania psalmów należy do sesji nadawcy.

Widok z `origin=share`:

- od razu pokazuje właściwy psalm;
- nie wykonuje rzutu i nie tworzy sesji czytania;
- ukrywa użytkownika, losowanie, reset i ponowne udostępnianie;
- pokazuje tylko `Zamknij`, które wraca do zamkniętej księgi. Sesja odbiorcy zaczyna się dopiero po otwarciu księgi.

## Kanały

`react-share` obsługuje WhatsApp, Facebook, X i e-mail. `Więcej` uruchamia systemowy panel Web Share API, a gdy przeglądarka go nie udostępnia — kopiuje wiadomość.

Discord nie publikuje zwykłego webowego adresu „share intent”. Przycisk Discord kopiuje tytuł i link, otwiera `https://discord.com/channels/@me`, a użytkownik wybiera rozmowę i wkleja wiadomość. Na telefonie Discord może być dostępny bezpośrednio przez `Więcej` w systemowym panelu udostępniania.

## Gdyby automatyczna publikacja na Discordzie była kiedyś potrzebna

Automatyczne wysyłanie do wybranego kanału jest osobną integracją. Wymaga aplikacji w Discord Developer Portal, OAuth2 z zakresem `webhook.incoming`, backendowego callbacku, bezpiecznego przechowywania tokenu webhooka i ekranu odłączania integracji. Nie jest to potrzebne do obecnego udostępniania przez użytkownika.
