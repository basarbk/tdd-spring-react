package com.hoaxify.hoaxify.user;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

	@PostMapping("/api/1.0/users")
	void createUser() {
		
	}
}
