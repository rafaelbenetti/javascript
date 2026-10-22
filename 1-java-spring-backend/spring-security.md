# Spring Security (Spring Security 6, Spring Boot 3.x)

> Group 1 · Priority HIGH
> Related: [core concepts](java-spring-boot-essentials.md) · [interview index](spring-boot.md) · [testing secured endpoints](spring-boot-testing.md) · [security across services](java-microservices.md)

This file is the single home for security in these notes. The other files link here instead of repeating it.

## Say it in 1 minute
"Spring Security is a chain of servlet filters that runs in front of the DispatcherServlet, so a request is authenticated before any controller code runs. For an API I declare a SecurityFilterChain bean that is stateless and acts as an OAuth2 resource server. It validates the JWT's signature against the identity provider's published keys, checks the expiry, issuer and audience, and stores the result in the SecurityContext. URL rules and method security decide what the caller may do, and the service still checks that the caller owns the resource. CSRF protection can be switched off only because a bearer token is not sent automatically by the browser. With cookie sessions I keep it on."

---

## 1. Authentication vs authorization
- **Authentication** answers "who are you?". The caller proves an identity with a password, a token, a certificate, or a login at an external identity provider.
- **Authorization** answers "what may you do?". Once the identity is known, rules on URLs, methods and individual records decide whether the action is allowed.
- They fail differently. A missing or invalid identity is **401 Unauthorized**. A known identity without permission is **403 Forbidden**.
- Keep them separate in your head. Most real security bugs are not broken logins but broken authorization: a logged-in user reading someone else's data.

## 2. The filter chain
- Spring Security plugs **one servlet filter** into the server, and that filter delegates to an ordered list of security filters called the **security filter chain**.
- Each filter has one job: read a token, read a session, handle a login form, reject a CSRF-less form post, translate security exceptions into 401 or 403, and finally check the URL rules.
- Because this happens before the DispatcherServlet, an unauthenticated request never reaches a controller, an interceptor or an aspect. See the request pipeline in [the essentials file](java-spring-boot-essentials.md#request-pipeline-filters-interceptors-and-aspects).
- An application can have **several chains**, each matching a set of paths. A common split is one chain for the API and one for Actuator, so health checks and the API have different rules.
- In Spring Security 6 the old configurer-adapter base class is gone. Configuration is a `SecurityFilterChain` bean, shown below. This is the one copy of the security config in these notes.

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())                  // OK for stateless bearer-token APIs only
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/actuator/health", "/api/v1/public/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))   // validates JWT via issuer JWKS
            .build();
    }
}
// method level: @PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.name")
```

## 3. The SecurityContext
- When a filter authenticates a request, it builds an **Authentication** object: the principal (who), the authorities (roles and scopes), and whether it's authenticated.
- That object goes into the **SecurityContext**, which the SecurityContextHolder keeps for the current thread by default.
- Everything later in the request reads it from there: URL rules, method security, and your own code that needs the current user. Nothing parses the token a second time.
- With stateless APIs the context is rebuilt from the token on every request and thrown away afterwards. With sessions it is saved in the HTTP session between requests.
- Because it's thread-bound, work handed to another thread (async methods, executors) needs the context propagated deliberately, or it runs as anonymous.

## 4. JWT and OAuth2 resource servers
- In OAuth2 terms your API is a **resource server**. An **authorization server** (Cognito, Auth0, Keycloak, Entra ID) logs the user in and issues an access token. The API only validates tokens. It never sees passwords.
- A **JWT** is a signed set of claims. Validation means checking, in order:
  - **Signature**: the token was signed by the issuer's private key and hasn't been altered. The allowed algorithms are pinned, so a token can't choose a weaker one.
  - **exp** (and nbf): it hasn't expired and is already valid.
  - **iss**: it was issued by the identity provider you trust.
  - **aud**: it was issued for *this* API, not for another application that happens to use the same provider. Spring doesn't enforce audience unless you configure it.
- **JWKS**: the issuer publishes its public keys at a well-known URL. Spring Boot finds it from the issuer URI, fetches and caches the keys, and picks the right one by the key id in the token header. That allows key rotation without redeploying.
- Claims such as scopes or roles are then mapped to authorities, which the authorization rules use.
- Don't hand-roll a JWT filter. The resource-server support already does validation, error responses and key rotation correctly.

## 5. Passwords: PasswordEncoder and BCrypt
- If the application stores passwords itself, they are stored as a **slow, salted, one-way hash**, never encrypted and never plain.
- A **PasswordEncoder** hashes on registration and compares on login. **BCrypt** is the usual default: each hash has its own random salt, and a cost factor makes each guess deliberately expensive, which defeats brute force and precomputed tables. Argon2 and SCrypt are stronger memory-hard options.
- The delegating encoder stores an algorithm prefix with each hash, so you can upgrade the algorithm later and old hashes still verify.
- When an external identity provider handles login, your service stores no passwords at all, which is usually the better design.

## 6. Sessions vs tokens, and refresh tokens
- **Session-based**: after login the server keeps the session state and the browser holds only a session id cookie. Logout and revocation are easy because the server just deletes the session. Scaling needs sticky sessions or a shared store.
- **Token-based**: the client sends a self-contained signed token on every request, and the server keeps no state. That suits APIs, mobile clients and many services behind a gateway. The catch is revocation: a valid token stays valid until it expires.
- That's why **access tokens are short-lived** (minutes) and paired with a **refresh token**. The refresh token is long-lived, sent only to the authorization server, stored more carefully, rotated on each use, and revocable. When the access token expires, the client trades the refresh token for a new one.
- In a browser, where the tokens live matters. Script-readable storage is exposed to XSS. HttpOnly cookies are safe from scripts but bring CSRF back into play. Many teams put a backend-for-frontend in between so the browser holds only a session cookie.

## 7. CORS
- Browsers block a page from reading responses from a different origin (scheme, host, port) unless the server allows it. **CORS** is how the server says which origins, methods and headers are allowed, often answering a preflight request first.
- CORS protects *users' browsers*, not your API. A script or curl ignores it completely, so it is never a substitute for authentication.
- Configure it in Spring Security, so preflight requests are answered before authentication rejects them. List exact origins. Allowing any origin together with credentials is a misconfiguration.

## 8. CSRF
- **Cross-site request forgery** works because the browser **attaches cookies automatically** to any request to your domain, even one triggered by a malicious page on another site. If the session lives in a cookie, the forged request arrives authenticated.
- The defence is a CSRF token: a value the real page includes and the attacker's page can't read. Spring Security enforces it by default for state-changing requests.
- A **bearer token in the Authorization header is not attached automatically**. The attacker's page can't make the browser add it, so a forged request arrives unauthenticated. That is the only reason disabling CSRF is acceptable for a stateless bearer-token API.
- If the token moves into a cookie, the API is cookie-authenticated again and CSRF protection must come back.

## 9. Method security
- Enabling method security lets you put authorization rules on service methods, checked before the method runs (and optionally on the returned value).
- Rules can use roles, scopes, method arguments and the current authentication, so "admins, or the owner named in this argument" is expressible.
- It's implemented with a proxy, just like transactions, so it has the same self-call blind spot. See [bean lifecycle and proxies](java-spring-boot-essentials.md#bean-lifecycle-and-proxies).
- URL rules are coarse-grained and method rules are finer. Use both.

## 10. Ownership checks
- Roles say what *kind* of thing a user may do. They don't say *which records*. "A consumer can read favorites" doesn't mean "any consumer can read every favorite".
- Broken access control is #1 in the OWASP Top 10 (2025). The classic case is changing an id in the URL and getting someone else's data.
- The fix is to tie the query or the check to the authenticated principal: load the record by id *and* owner, or compare the owner with the current user in the service, and return 404 or 403 when they don't match.
- These checks belong in the service layer, where the business rules are, and they need tests.

---

## Interview questions (spoken model answers)

**Q: How does Spring Security work?**
"It's a chain of servlet filters in front of the DispatcherServlet. One filter authenticates the request, for example from a JWT, and puts an Authentication into the SecurityContext. Later filters and method security read that to authorize. Failures become 401 or 403 before the controller ever runs."

**Q: How do you secure a Spring Boot API?**
"A `SecurityFilterChain` bean: stateless, and the OAuth2 resource server validates JWTs against the identity provider's keys. URL rules plus `@PreAuthorize` for method-level checks, and ownership checks in the service to prevent broken access control. CSRF can be disabled only because it's a bearer-token API. With cookie sessions I'd keep it. Plus input validation, parameterised queries, and dependency scanning in CI. At EPAM I've worked on Veracode findings remediation."

**Q: How do you secure REST APIs with JWT?**
"I use the resource-server support rather than writing a filter. It fetches the issuer's JWKS, verifies the signature with pinned algorithms, checks exp and iss, and I add an audience check. Claims become authorities. Access tokens are short-lived, and refresh tokens handle renewal."

**Q: Why can you disable CSRF for a JWT API?**
"CSRF relies on the browser sending credentials automatically, which it does for cookies. It never adds an Authorization header by itself, so a forged cross-site request has no token. If we moved the token into a cookie, I'd turn CSRF back on."

---

## Traps and gotchas
- Disabling CSRF on a cookie-session app is a real vulnerability.
- Forgetting the audience check accepts tokens minted for other applications.
- CORS is not access control.
- Roles without ownership checks lead to broken access control.
- Mentioning the removed configurer-adapter class as current dates you. Use a `SecurityFilterChain` bean.
- `@WebMvcTest` without security test support gives 401 surprises. See [testing](spring-boot-testing.md).
