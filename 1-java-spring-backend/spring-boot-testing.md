# Testing Spring Boot Services (JUnit 5, Mockito, slices, Testcontainers)

> Group 1 · Priority HIGH · Prep guide Q19 · Status: new file

## Say it in 30 seconds
"I follow the test pyramid. Lots of fast unit tests on services with JUnit 5 and Mockito, where dependencies are mocked through the constructor. Then slice tests: `@WebMvcTest` with MockMvc for controllers (status codes, validation, JSON), and `@DataJpaTest` for repository queries. A few `@SpringBootTest` integration tests against a real MySQL in Testcontainers. Coverage is measured with JaCoCo and enforced as a gate in Jenkins. On OneHome I took frontend coverage from about 30–40% to 80% and added a CI gate so it can't slip. The same principle applies on the backend: the gate is a floor, and meaningful assertions matter more than the number."

---

## 1. Core concepts

### Unit test: service with Mockito (no Spring context, milliseconds)
```java
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    @Mock ListingRepository listings;
    @Mock BookingRepository bookings;
    @InjectMocks BookingService service;          // constructor injection makes this trivial

    @Test
    void booksAvailableListing() {
        var listing = new Listing(1L, "Flat", AVAILABLE);
        when(listings.findById(1L)).thenReturn(Optional.of(listing));
        when(bookings.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Booking b = service.book(1L, 42L);

        assertThat(b.getUserId()).isEqualTo(42L);           // AssertJ
        assertThat(listing.getStatus()).isEqualTo(BOOKED);
        verify(bookings).save(any(Booking.class));
    }

    @Test
    void throwsWhenListingMissing() {
        when(listings.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.book(99L, 1L)).isInstanceOf(NotFoundException.class);
        verifyNoInteractions(bookings);
    }
}
```
- JUnit 5 essentials: `@Test`, `@BeforeEach`, `@DisplayName`, `@Nested`, `@ParameterizedTest` + `@CsvSource`/`@MethodSource`, `assertThrows`.
- Mockito: `when/thenReturn/thenThrow`, `verify(mock, times(1))`, `ArgumentCaptor`, `any()`/`eq()` (if you use a matcher for one argument, use matchers for all of them). Strict stubs flag unused stubbing.

### Controller slice: `@WebMvcTest`
```java
@WebMvcTest(ListingController.class)               // loads only the web layer (MVC, advice, converters)
class ListingControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ListingService service;           // Boot 3.4+/Spring 6.2; replaces deprecated @MockBean

    @Test
    void returns400OnInvalidBody() throws Exception {
        mvc.perform(post("/api/v1/listings")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title": "", "price": -5}
                    """))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.title").value("Validation failed"));
    }

    @Test
    void returns404WhenMissing() throws Exception {
        when(service.get(9L)).thenThrow(new NotFoundException("Listing 9"));
        mvc.perform(get("/api/v1/listings/9")).andExpect(status().isNotFound());
    }
}
```
With Spring Security on the classpath, add `@WithMockUser` or `.with(jwt())` from `spring-security-test`. Otherwise you get 401s.

### Repository slice: `@DataJpaTest`
```java
@DataJpaTest                                       // JPA + repos only, transactional + rolled back per test
@AutoConfigureTestDatabase(replace = Replace.NONE) // use the Testcontainers DB, not embedded H2
@Testcontainers
class ListingRepositoryTest {
    @Container @ServiceConnection                  // Boot 3.1+: auto-wires the datasource URL
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @Autowired ListingRepository repo;

    @Test
    void findsByCityWithOwnerInOneQuery() { ... }
}
```
- **Why Testcontainers over H2:** H2 isn't MySQL. Dialect, JSON functions, locking and case sensitivity differ, so tests can pass on H2 and fail in prod.
- `@ServiceConnection` (Boot 3.1+) removes the `@DynamicPropertySource` boilerplate.

### Full integration: `@SpringBootTest`
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
class BookingFlowIT {
    @Container @ServiceConnection static MySQLContainer<?> db = new MySQLContainer<>("mysql:8.4");
    @Autowired TestRestTemplate rest;   // or WebTestClient
    @Test void createAndFetchBooking() { ... }
}
```
Use these sparingly, because they're slow (the full context starts). Spring caches the context between tests with identical configuration, and every distinct `@MockitoBean` combination creates a new context.

### Other tools
- **Contract tests**: Spring Cloud Contract or Pact, so the React/BFF consumer and the Spring producer agree on the API. Or an OpenAPI spec plus generated typed clients (you used OpenAPI-generated clients on Benwer Cars).
- **External HTTP**: WireMock / `MockRestServiceServer`.
- **Messaging**: Testcontainers for Kafka or LocalStack (SQS/SNS), and Awaitility for async assertions.
- **Coverage**: the JaCoCo Maven/Gradle plugin, with `jacoco:check` failing the build below a threshold. Jenkins publishes the report, and Sonar has a quality gate.
- **Naming**: Maven Surefire runs `*Test` (unit), Failsafe runs `*IT` (integration) in the `verify` phase.

---

## 2. Interview questions (spoken model answers)

**Q: How do you test a Spring Boot service?**
"Bottom-up. Plain JUnit plus Mockito for business logic in services: fast and no Spring context. `@WebMvcTest` for controllers to check status codes, validation errors and JSON shape. `@DataJpaTest` with Testcontainers MySQL for custom queries, including that a fetch join really removes the N+1. A handful of `@SpringBootTest` end-to-end flows. All of it runs in the Jenkins pipeline with a JaCoCo coverage gate."

**Q: Unit vs integration test? Where do you draw the line?**
"A unit test isolates one class with its collaborators mocked, so it checks logic and branches. An integration test checks that real pieces work together: SQL against a real database, serialisation, security config, transactions. Mocks can't catch a wrong query or a broken mapping, so the risky boundaries get integration tests."

**Q: `@MockBean` vs `@Mock`?**
"`@Mock` is pure Mockito, for unit tests without Spring. `@MockBean` (now `@MockitoBean` since Boot 3.4) replaces a bean inside the Spring context in slice and integration tests. Overusing it creates many distinct contexts and slows the suite."

**Q: Why not H2 for tests?**
"Because it's not the production database. MySQL-specific SQL, locking and collation behave differently. Testcontainers gives a real MySQL in Docker, and with Boot 3.1's `@ServiceConnection` it's one annotation."

**Q: How do you keep quality from slipping?**
"Gates in CI. On OneHome I raised frontend coverage from roughly 30–40% to 80% and added an 80% gate in the pipeline so PRs below it fail. But coverage is a floor, not the goal: I review that tests assert behaviour and edge cases, not just execute lines. For Spring, the equivalent is JaCoCo plus a Sonar quality gate in Jenkins."

**Q: How do you test async or messaging code?**
"Unit-test the handler logic directly. For integration, use Testcontainers Kafka or LocalStack for SQS and assert with Awaitility instead of `Thread.sleep`. Make handlers idempotent and test the duplicate-delivery case explicitly."

---

## 3. Traps and gotchas
- `@SpringBootTest` for everything makes a slow, flaky suite.
- `@Transactional` on a test rolls back by default. That's great for isolation, but code that relies on a commit (e.g. after-commit events, a separate thread) won't see the data.
- Mocking the class under test, or verifying every interaction, gives brittle tests coupled to implementation.
- Mixing raw values and matchers in Mockito (`when(x.f(1, any()))`) throws `InvalidUseOfMatchersException`.
- `@WebMvcTest` without security setup gives 401/403 surprises.
- `@MockBean` is deprecated since Boot 3.4. Mention `@MockitoBean` to sound current.
- `Thread.sleep` in tests is flaky. Use Awaitility.
- High coverage with no assertions is worthless. Say so.
