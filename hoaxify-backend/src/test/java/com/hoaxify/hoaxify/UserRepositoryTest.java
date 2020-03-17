package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserRepository;

@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {
	
	@Autowired
	TestEntityManager testEntityManager;
	
	@Autowired
	UserRepository userRepository;
	
	@Test
	public void findByUsername_whenUserExists_returnsUser() {
		testEntityManager.persist(TestUtil.createValidUser());
		
		User inDB = userRepository.findByUsername("test-user");
		assertThat(inDB).isNotNull();
		
	}
	
	@Test
	public void findByUsername_whenUserDoesNotExist_returnsNull() {
		User inDB = userRepository.findByUsername("nonexistinguser");
		assertThat(inDB).isNull();
	}

}
