* [Storage](#storage)
    * [Cookies](#cookies)
    * [Local Storage](#local-storage)
    * [Session Storage](#session-storage)    

# Storage
-  Represents the way to store temporary data into the browser.

## Cookies
- [Pros]Compared to others, there's nothing AFAIK.

- [Cons] The 4K limit is for the entire cookie, including name, value, expiry date etc. To support most browsers, keep the name under 4000 bytes, and the overall cookie size under 4093 bytes.
- [Cons] The data is sent back to the server for every HTTP request (HTML, images, JavaScript, CSS, etc) - increasing the amount of traffic between client and server.
- [Cons] Typically, the following are allowed:
  - 300 cookies in total
  - 4096 bytes per cookie
  - 20 cookies per domain
  - 81920 bytes per domain(Given 20 cookies of max size 4096 = 81920 bytes.)

## Local Storage
- [Pros] Web storage can be viewed simplistically as an improvement on cookies, providing much greater storage capacity. If you look at the Mozilla source code we can see that 5BM is the default storage size for an entire domain. This gives you considerably more space to work with than a typical 4KB cookie.
- [Pros] The data is not sent back to the server for every HTTP request (HTML, images, JavaScript, CSS, etc) - reducing the amount of traffic between client and server.
- [Pros] The data stored in localStorage persists until explicitly deleted. Changes made are saved and available for all current and future visits to the site.

- [Cons] It works on same-origin policy. So, data stored will only be available on the same origin.

## Session Storage
- [Pros] It is similar to localStorage.
- [Pros] The data is not persistent i.e. data is only available per window (or tab in browsers like Chrome and Firefox). Data is only available during the page session. Changes made are saved and available for the current page, as well as future visits to the site on the same window. Once the window is closed, the storage is deleted.

- [Cons] The data is available only inside the window/tab in which it was set.
- [Cons] Like localStorage, it works on same-origin policy. So, data stored will only be available on the same origin.
