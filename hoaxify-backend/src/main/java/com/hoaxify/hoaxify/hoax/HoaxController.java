package com.hoaxify.hoaxify.hoax;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hoaxify.hoaxify.shared.CurrentUser;
import com.hoaxify.hoaxify.user.User;

@RestController
@RequestMapping("/api/1.0")
public class HoaxController {
	
	@Autowired
	HoaxService hoaxService;

	@PostMapping("/hoaxes")
	void createHoax(@Valid @RequestBody Hoax hoax, @CurrentUser User user) {
		hoaxService.save(user, hoax);
	}
	
}
