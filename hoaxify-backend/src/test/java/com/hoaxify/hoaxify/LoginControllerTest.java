package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;

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

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {
	
	private static final String API_1_0_LOGIN = "/api/1.0/login";
	
	@Autowired
	TestRestTemplate testRestTemplate;
	
	@Test
	public void postLogin_withoutUserCredentials_receiveUnauthorized() {
		ResponseEntity<Object> response = login(Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}
	
	@Test
	public void postLogin_withIncorrectCredentials_receiveUnauthorized() {
		authenticate();
		ResponseEntity<Object> response = login(Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	private void authenticate() {
		testRestTemplate.getRestTemplate()
			.getInterceptors().add(new BasicAuthenticationInterceptor("test-user", "P4ssword"));
	}
	
	public <T> ResponseEntity<T> login(Class<T> responseType){
		return testRestTemplate.postForEntity(API_1_0_LOGIN, null, responseType);
	}

}
