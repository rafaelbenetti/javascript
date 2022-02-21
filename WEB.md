# Web General Concepts

* [Storage](#storage)
  * [Cookies](#cookies)
  * [Local Storage](#local-storage)
  * [Session Storage](#session-storage)
* [Authentication](#authentication)
  * [Knowledge based authentication](#knowledge-based-authentication)
  * [Possession based authentication](#possession-based-authentication)
  * [Multi Factor authentication](#multi-factor-authentication)
* [Authorization](#authorization)
  * [Cookies + Session Authorization](#cookies-session-authorization)
  * [JWT Authorization](#jwt-authorization)
* [Principal](#principal)
* [CI CD](#continuous_integration_and_continuous_delivery)
  * [Continuous Integration](#continuous_integration)
  * [Continuous Delivery](#continuous_delivery)

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


# Authentication
- Its used to confirm who are you.
- Usually contains one ID that represents the person trying to login.

## Knowledge based authentication 
- User provides user and password.
- [Advantage] Easy to implement and use
- [Disadvantage] Easy to access if someone discover your data.

## Possession based authentication 
- Use some tool or device that the user has possesion Phone/Text Messages.
	- Phone and Text Messages
	- Token or Key Cards

## Multi Factor Authentication
- Its the combination of Knowledge and Possesion approaches.

# Authorization
- It's used to define what an user can do.
- It can be defining roles (READONLY, SUPERUSER, ADMIN, etc)

## Cookies Session Authorization
- UI sends login request -> Backend creates a session and return session ID.
- UI save the session ID on cookies -> Every new request the cookies are sent together.
- [Cons] Need to store and keep the user data on the server side.

![Cookies Session Authorization](src/assets/cookies-session-authorization.png)

## JWT Authorization
- UI sends login request -> Backend creates the JWT token and return to the UI.
- Every new request the JWT Token should be sent on the request.
- [Pros] The server does not keep any stored data.
- [Pros] The token has a unique secret key.

![JWT Authorization](src/assets/jwt-authorization.png)

# Principal
- Its the current logged user.
- So the app keeps the principal or logged user on memory.

# Countinuous Integration and Continuous Delivery

## Continuous Integration
- Developers practicing continuous integration merge their changes back to the main branch as often as possible. The developer's changes are validated by creating a build and running automated tests against the build. By doing so, you avoid integration challenges that can happen when waiting for release day to merge changes into the release branch.

- Continuous integration puts a great emphasis on testing automation to check that the application is not broken whenever new commits are integrated into the main branch.

## Continuous Delivery
- Continuous delivery is an extension of continuous integration since it automatically deploys all code changes to a testing and/or production environment after the build stage.
