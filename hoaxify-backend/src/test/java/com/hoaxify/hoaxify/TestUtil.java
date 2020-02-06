package com.hoaxify.hoaxify;

import com.hoaxify.hoaxify.hoax.Hoax;
import com.hoaxify.hoaxify.user.User;

public class TestUtil {

	public static User createValidUser() {
		User user = new User();
		user.setUsername("test-user");
		user.setDisplayName("test-display");
		user.setPassword("P4ssword");
		user.setImage("profile-image.png");
		return user;
	}
	
	public static User createValidUser(String username) {
		User user = createValidUser();
		user.setUsername(username);
		return user;
	}
	
	public static Hoax createValidHoax() {
		Hoax hoax = new Hoax();
		hoax.setContent("test content for the test hoax");
		return hoax;
	}
}
