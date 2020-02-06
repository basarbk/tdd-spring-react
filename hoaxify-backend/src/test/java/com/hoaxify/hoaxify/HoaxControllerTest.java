package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import com.hoaxify.hoaxify.error.ApiError;
import com.hoaxify.hoaxify.hoax.Hoax;
import com.hoaxify.hoaxify.hoax.HoaxRepository;
import com.hoaxify.hoaxify.user.UserRepository;
import com.hoaxify.hoaxify.user.UserService;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class HoaxControllerTest {

	private static final String API_1_0_HOAXES = "/api/1.0/hoaxes";

	@Autowired
	TestRestTemplate testRestTemplate;
	
	@Autowired
	UserService userService;
	
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	HoaxRepository hoaxRepository;
	
	@Before
	public void cleanup() {
		hoaxRepository.deleteAll();
		userRepository.deleteAll();
		testRestTemplate.getRestTemplate().getInterceptors().clear();
	}
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsAuthorized_receiveOk() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = TestUtil.createValidHoax();
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	

	@Test
	public void postHoax_whenHoaxIsValidAndUserIsUnauthorized_receiveUnauthorized() {
		Hoax hoax = TestUtil.createValidHoax();
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsUnauthorized_receiveApiError() {
		Hoax hoax = TestUtil.createValidHoax();
		ResponseEntity<ApiError> response = postHoax(hoax, ApiError.class);
		assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
	}
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsAuthorized_hoaxSavedToDatabase() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = TestUtil.createValidHoax();
		postHoax(hoax, Object.class);
		
		assertThat(hoaxRepository.count()).isEqualTo(1);
	}
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsAuthorized_hoaxSavedToDatabaseWithTimestamp() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = TestUtil.createValidHoax();
		postHoax(hoax, Object.class);
		
		Hoax inDB = hoaxRepository.findAll().get(0);
		
		assertThat(inDB.getTimestamp()).isNotNull();
	}
	
	@Test
	public void postHoax_whenHoaxContentNullAndUserIsAuthorized_receiveBadRequest() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	public void postHoax_whenHoaxContentLessThan10CharactersAndUserIsAuthorized_receiveBadRequest() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		hoax.setContent("123456789");
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}
	
	@Test
	public void postHoax_whenHoaxContentIs5000CharactersAndUserIsAuthorized_receiveOk() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		String veryLongString = IntStream.rangeClosed(1, 5000).mapToObj(i -> "x").collect(Collectors.joining());
		hoax.setContent(veryLongString);
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	
	@Test
	public void postHoax_whenHoaxContentMoreThan5000CharactersAndUserIsAuthorized_receiveBadRequest() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		String veryLongString = IntStream.rangeClosed(1, 5001).mapToObj(i -> "x").collect(Collectors.joining());
		hoax.setContent(veryLongString);
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}
	

	@Test
	public void postHoax_whenHoaxContentNullAndUserIsAuthorized_receiveApiErrorWithValidationErrors() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		ResponseEntity<ApiError> response = postHoax(hoax, ApiError.class);
		Map<String, String> validationErrors = response.getBody().getValidationErrors();
		assertThat(validationErrors.get("content")).isNotNull();
	}

	private <T> ResponseEntity<T> postHoax(Hoax hoax, Class<T> responseType) {
		return testRestTemplate.postForEntity(API_1_0_HOAXES, hoax, responseType);
	}
	

	private void authenticate(String username) {
		testRestTemplate.getRestTemplate()
			.getInterceptors().add(new BasicAuthenticationInterceptor(username, "P4ssword"));
	}
}
