* [Storage](#storage)
    * [Cookies](#cookies)
    * [Local Storage](#local-storage)
    * [Session Storage](#session-storage)    

# Storage
-  Represents the way to store temporary data into the browser.

## Cookies
- [Cons] There is a 4k limit for the entire cookie, including name, value, expiry date etc.
- [Cons] The data is sent back to the server for every HTTP request (HTML, images, JavaScript, CSS, etc)
- [Cons] Typically, the following are allowed:
  - 300 cookies in total
  - 4096 bytes per cookie
  - 20 cookies per domain
  - 81920 bytes per domain(Given 20 cookies of max size 4096 = 81920 bytes.)

## Local Storage
- [Pros] Web storage have greater storage, up to 5mp per domain.
- [Pros] The data is NOT sent back to the server for every HTTP request.
- [Pros] The data stored in localStorage persists until explicitly deleted.
- [Cons] It works on same-origin policy. So, data stored will only be available on the same origin.

## Session Storage
- [Pros] It is similar to localStorage.
- [Pros] Data is only available during the page session. Once the window is closed, the storage is deleted.
- [Cons] The data is available only inside the window/tab in which it was set.
- [Cons] It works on same-origin policy. So, data stored will only be available on the same origin.
