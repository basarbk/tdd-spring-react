package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.multipart.MultipartFile;

import com.hoaxify.hoaxify.configuration.AppConfiguration;
import com.hoaxify.hoaxify.error.ApiError;
import com.hoaxify.hoaxify.file.FileAttachment;
import com.hoaxify.hoaxify.file.FileAttachmentRepository;
import com.hoaxify.hoaxify.file.FileService;
import com.hoaxify.hoaxify.hoax.Hoax;
import com.hoaxify.hoaxify.hoax.HoaxRepository;
import com.hoaxify.hoaxify.hoax.HoaxService;
import com.hoaxify.hoaxify.hoax.vm.HoaxVM;
import com.hoaxify.hoaxify.shared.GenericResponse;
import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserRepository;
import com.hoaxify.hoaxify.user.UserService;

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
	
	@Autowired
	HoaxService hoaxService;
	
	@Autowired
	FileAttachmentRepository fileAttachmentRepository;
	
	@Autowired
	FileService fileService;
	
	@Autowired
	AppConfiguration appConfiguration;
	
	@PersistenceUnit
	private EntityManagerFactory entityManagerFactory;
	
	@BeforeEach
	public void cleanup() throws IOException {
		fileAttachmentRepository.deleteAll();
		hoaxRepository.deleteAll();
		userRepository.deleteAll();
		testRestTemplate.getRestTemplate().getInterceptors().clear();
		FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
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
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsAuthorized_hoaxSavedWithAuthenticatedUserInfo() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = TestUtil.createValidHoax();
		postHoax(hoax, Object.class);
		
		Hoax inDB = hoaxRepository.findAll().get(0);
		
		assertThat(inDB.getUser().getUsername()).isEqualTo("user1");
	}
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsAuthorized_hoaxCanBeAccessedFromUserEntity() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = TestUtil.createValidHoax();
		postHoax(hoax, Object.class);
		
		EntityManager entityManager = entityManagerFactory.createEntityManager();
		
		User inDBUser = entityManager.find(User.class, user.getId());
		assertThat(inDBUser.getHoaxes().size()).isEqualTo(1);
		
	}
	

	@Test
	public void postHoax_whenHoaxIsValidAndUserIsAuthorized_receiveHoaxVM() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = TestUtil.createValidHoax();
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");
	}

	@Test
	public void postHoax_whenHoaxHasFileAttachmentAndUserIsAuthorized_fileAttachmentHoaxRelationIsUpdatedInDatabase() throws IOException {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachment(file);
		
		Hoax hoax = TestUtil.createValidHoax();
		hoax.setAttachment(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		FileAttachment inDB = fileAttachmentRepository.findAll().get(0);
		assertThat(inDB.getHoax().getId()).isEqualTo(response.getBody().getId());
	}

	@Test
	public void postHoax_whenHoaxHasFileAttachmentAndUserIsAuthorized_hoaxFileAttachmentRelationIsUpdatedInDatabase() throws IOException {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachment(file);
		
		Hoax hoax = TestUtil.createValidHoax();
		hoax.setAttachment(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		Hoax inDB = hoaxRepository.findById(response.getBody().getId()).get();
		assertThat(inDB.getAttachment().getId()).isEqualTo(savedFile.getId());
	}

	@Test
	public void postHoax_whenHoaxHasFileAttachmentAndUserIsAuthorized_receiveHoaxVMWithAttachment() throws IOException {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachment(file);
		
		Hoax hoax = TestUtil.createValidHoax();
		hoax.setAttachment(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		assertThat(response.getBody().getAttachment().getName()).isEqualTo(savedFile.getName());
	}

	private MultipartFile createFile() throws IOException {
		ClassPathResource imageResource = new ClassPathResource("profile.png");
		byte[] fileAsByte = FileUtils.readFileToByteArray(imageResource.getFile());
		
		MultipartFile file = new MockMultipartFile("profile.png", fileAsByte);
		return file;
	}
	
	@Test
	public void getHoaxes_whenThereAreNoHoaxes_receiveOk() {
		ResponseEntity<Object> response = getHoaxes(new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	
	@Test
	public void getHoaxes_whenThereAreNoHoaxes_receivePageWithZeroItems() {
		ResponseEntity<TestPage<Object>> response = getHoaxes(new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(0);
	}

	@Test
	public void getHoaxes_whenThereAreHoaxes_receivePageWithItems() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<Object>> response = getHoaxes(new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(3);
	}

	@Test
	public void getHoaxes_whenThereAreHoaxes_receivePageWithHoaxVM() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getHoaxes(new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		HoaxVM storedHoax = response.getBody().getContent().get(0);
		assertThat(storedHoax.getUser().getUsername()).isEqualTo("user1");
	}
	
	@Test
	public void getHoaxesOfUser_whenUserExists_receiveOk() {
		userService.save(TestUtil.createValidUser("user1"));
		ResponseEntity<Object> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	
	@Test
	public void getHoaxesOfUser_whenUserDoesNotExist_receiveNotFound() {
		ResponseEntity<Object> response = getHoaxesOfUser("unknown-user", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}
	@Test
	public void getHoaxesOfUser_whenUserExists_receivePageWithZeroHoaxes() {
		userService.save(TestUtil.createValidUser("user1"));
		ResponseEntity<TestPage<Object>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(0);
	}

	@Test
	public void getHoaxesOfUser_whenUserExistWithHoax_receivePageWithHoaxVM() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		HoaxVM storedHoax = response.getBody().getContent().get(0);
		assertThat(storedHoax.getUser().getUsername()).isEqualTo("user1");
	}
	
	@Test
	public void getHoaxesOfUser_whenUserExistWithMultipleHoaxes_receivePageWithMatchingHoaxesCount() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(3);
	}
	
	@Test
	public void getHoaxesOfUser_whenMultipleUserExistWithMultipleHoaxes_receivePageWithMatchingHoaxesCount() {
		User userWithThreeHoaxes = userService.save(TestUtil.createValidUser("user1"));
		IntStream.rangeClosed(1, 3).forEach(i -> {
			hoaxService.save(userWithThreeHoaxes, TestUtil.createValidHoax());	
		});
		
		User userWithFiveHoaxes = userService.save(TestUtil.createValidUser("user2"));
		IntStream.rangeClosed(1, 5).forEach(i -> {
			hoaxService.save(userWithFiveHoaxes, TestUtil.createValidHoax());	
		});
		
		
		ResponseEntity<TestPage<HoaxVM>> response = getHoaxesOfUser(userWithFiveHoaxes.getUsername(), new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(5);
	}
	
	@Test
	public void getOldHoaxes_whenThereAreNoHoaxes_receiveOk() {
		ResponseEntity<Object> response = getOldHoaxes(5, new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	
	@Test
	public void getOldHoaxes_whenThereAreHoaxes_receivePageWithItemsBeforeProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<Object>> response = getOldHoaxes(fourth.getId(), new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(3);
	}
	
	@Test
	public void getOldHoaxes_whenThereAreHoaxes_receivePageWithHoaxVMBeforeProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxes(fourth.getId(), new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
	}

	@Test
	public void getOldHoaxesOfUser_whenUserExistThereAreNoHoaxes_receiveOk() {
		userService.save(TestUtil.createValidUser("user1"));
		ResponseEntity<Object> response = getOldHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	@Test
	public void getOldHoaxesOfUser_whenUserExistAndThereAreHoaxes_receivePageWithItemsBeforeProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<Object>> response = getOldHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(3);
	}
	
	@Test
	public void getOldHoaxesOfUser_whenUserExistAndThereAreHoaxes_receivePageWithHoaxVMBeforeProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
	}
	

	@Test
	public void getOldHoaxesOfUser_whenUserDoesNotExistThereAreNoHoaxes_receiveNotFound() {
		ResponseEntity<Object> response = getOldHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	public void getOldHoaxesOfUser_whenUserExistAndThereAreNoHoaxes_receivePageWithZeroItemsBeforeProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		userService.save(TestUtil.createValidUser("user2"));
		
		ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(0);
	}

	@Test
	public void getNewHoaxes_whenThereAreHoaxes_receiveListOfItemsAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<List<Object>> response = getNewHoaxes(fourth.getId(), new ParameterizedTypeReference<List<Object>>() {});
		assertThat(response.getBody().size()).isEqualTo(1);
	}

	@Test
	public void getNewHoaxes_whenThereAreHoaxes_receiveListOfHoaxVMAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<List<HoaxVM>> response = getNewHoaxes(fourth.getId(), new ParameterizedTypeReference<List<HoaxVM>>() {});
		assertThat(response.getBody().get(0).getDate()).isGreaterThan(0);
	}
	

	@Test
	public void getNewHoaxesOfUser_whenUserExistThereAreNoHoaxes_receiveOk() {
		userService.save(TestUtil.createValidUser("user1"));
		ResponseEntity<Object> response = getNewHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	
	@Test
	public void getNewHoaxesOfUser_whenUserExistAndThereAreHoaxes_receiveListWithItemsAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<List<Object>> response = getNewHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<List<Object>>() {});
		assertThat(response.getBody().size()).isEqualTo(1);
	}
	
	@Test
	public void getNewHoaxesOfUser_whenUserExistAndThereAreHoaxes_receiveListWithHoaxVMAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<List<HoaxVM>> response = getNewHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<List<HoaxVM>>() {});
		assertThat(response.getBody().get(0).getDate()).isGreaterThan(0);
	}
	

	@Test
	public void getNewHoaxesOfUser_whenUserDoesNotExistThereAreNoHoaxes_receiveNotFound() {
		ResponseEntity<Object> response = getNewHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	public void getNewHoaxesOfUser_whenUserExistAndThereAreNoHoaxes_receiveListWithZeroItemsAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		userService.save(TestUtil.createValidUser("user2"));
		
		ResponseEntity<List<HoaxVM>> response = getNewHoaxesOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<List<HoaxVM>>() {});
		assertThat(response.getBody().size()).isEqualTo(0);
	}

	@Test
	public void getNewHoaxCount_whenThereAreHoaxes_receiveCountAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<Map<String, Long>> response = getNewHoaxCount(fourth.getId(), new ParameterizedTypeReference<Map<String, Long>>() {});
		assertThat(response.getBody().get("count")).isEqualTo(1);
	}


	@Test
	public void getNewHoaxCountOfUser_whenThereAreHoaxes_receiveCountAfterProvidedId() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, TestUtil.createValidHoax());
		hoaxService.save(user, TestUtil.createValidHoax());
		
		ResponseEntity<Map<String, Long>> response = getNewHoaxCountOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<Map<String, Long>>() {});
		assertThat(response.getBody().get("count")).isEqualTo(1);
	}
	
	@Test
	public void deleteHoax_whenUserIsUnAuthorized_receiveUnauthorized() {
		ResponseEntity<Object> response = deleteHoax(555, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}
	
	@Test
	public void deleteHoax_whenUserIsAuthorized_receiveOk() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = hoaxService.save(user, TestUtil.createValidHoax());

		ResponseEntity<Object> response = deleteHoax(hoax.getId(), Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		
	}
	
	@Test
	public void deleteHoax_whenUserIsAuthorized_receiveGenericResponse() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = hoaxService.save(user, TestUtil.createValidHoax());

		ResponseEntity<GenericResponse> response = deleteHoax(hoax.getId(), GenericResponse.class);
		assertThat(response.getBody().getMessage()).isNotNull();
		
	}

	@Test
	public void deleteHoax_whenUserIsAuthorized_hoaxRemovedFromDatabase() {
		User user = userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = hoaxService.save(user, TestUtil.createValidHoax());

		deleteHoax(hoax.getId(), Object.class);
		Optional<Hoax> inDB = hoaxRepository.findById(hoax.getId());
		assertThat(inDB.isPresent()).isFalse();
		
	}

	@Test
	public void deleteHoax_whenHoaxIsOwnedByAnotherUser_receiveForbidden() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		User hoaxOwner = userService.save(TestUtil.createValidUser("hoax-owner"));
		Hoax hoax = hoaxService.save(hoaxOwner, TestUtil.createValidHoax());

		ResponseEntity<Object> response = deleteHoax(hoax.getId(), Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
		
	}

	@Test
	public void deleteHoax_whenHoaxNotExist_receiveForbidden() {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		ResponseEntity<Object> response = deleteHoax(5555, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
		
	}

	@Test
	public void deleteHoax_whenHoaxHasAttachment_attachmentRemovedFromDatabase() throws IOException {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachment(file);
		
		Hoax hoax = TestUtil.createValidHoax();
		hoax.setAttachment(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		long hoaxId = response.getBody().getId();
		
		deleteHoax(hoaxId, Object.class);
		
		Optional<FileAttachment> optionalAttachment = fileAttachmentRepository.findById(savedFile.getId());
		
		assertThat(optionalAttachment.isPresent()).isFalse();
	}

	@Test
	public void deleteHoax_whenHoaxHasAttachment_attachmentRemovedFromStorage() throws IOException {
		userService.save(TestUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachment(file);
		
		Hoax hoax = TestUtil.createValidHoax();
		hoax.setAttachment(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		long hoaxId = response.getBody().getId();
		
		deleteHoax(hoaxId, Object.class);
		String attachmentFolderPath = appConfiguration.getFullAttachmentsPath() + "/" + savedFile.getName();
		File storedImage = new File(attachmentFolderPath);
		assertThat(storedImage.exists()).isFalse();
	}
	public <T> ResponseEntity<T> deleteHoax(long hoaxId, Class<T> responseType){
		return testRestTemplate.exchange(API_1_0_HOAXES + "/" + hoaxId, HttpMethod.DELETE, null, responseType);
	}
	
	public <T> ResponseEntity<T> getNewHoaxCount(long hoaxId, ParameterizedTypeReference<T> responseType){
		String path = API_1_0_HOAXES + "/" + hoaxId +"?direction=after&count=true";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}

	public <T> ResponseEntity<T> getNewHoaxCountOfUser(long hoaxId, String username, ParameterizedTypeReference<T> responseType){
		String path = "/api/1.0/users/" + username + "/hoaxes/" + hoaxId +"?direction=after&count=true";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}

	
	public <T> ResponseEntity<T> getNewHoaxes(long hoaxId, ParameterizedTypeReference<T> responseType){
		String path = API_1_0_HOAXES + "/" + hoaxId +"?direction=after&sort=id,desc";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}

	public <T> ResponseEntity<T> getNewHoaxesOfUser(long hoaxId, String username, ParameterizedTypeReference<T> responseType){
		String path = "/api/1.0/users/" + username + "/hoaxes/" + hoaxId +"?direction=after&sort=id,desc";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}
	
	public <T> ResponseEntity<T> getOldHoaxes(long hoaxId, ParameterizedTypeReference<T> responseType){
		String path = API_1_0_HOAXES + "/" + hoaxId +"?direction=before&page=0&size=5&sort=id,desc";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}

	public <T> ResponseEntity<T> getOldHoaxesOfUser(long hoaxId, String username, ParameterizedTypeReference<T> responseType){
		String path = "/api/1.0/users/" + username + "/hoaxes/" + hoaxId +"?direction=before&page=0&size=5&sort=id,desc";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}
	
	public <T> ResponseEntity<T> getHoaxesOfUser(String username, ParameterizedTypeReference<T> responseType){
		String path = "/api/1.0/users/" + username + "/hoaxes";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}

	public <T> ResponseEntity<T> getHoaxes(ParameterizedTypeReference<T> responseType){
		return testRestTemplate.exchange(API_1_0_HOAXES, HttpMethod.GET, null, responseType);
	}
	
	private <T> ResponseEntity<T> postHoax(Hoax hoax, Class<T> responseType) {
		return testRestTemplate.postForEntity(API_1_0_HOAXES, hoax, responseType);
	}
	

	private void authenticate(String username) {
		testRestTemplate.getRestTemplate()
			.getInterceptors().add(new BasicAuthenticationInterceptor(username, "P4ssword"));
	}
	
	@AfterEach
	public void cleanupAfter() {
		fileAttachmentRepository.deleteAll();
		hoaxRepository.deleteAll();
	}
}
