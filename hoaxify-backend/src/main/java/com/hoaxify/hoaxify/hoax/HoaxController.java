package com.hoaxify.hoaxify.hoax;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/1.0")
public class HoaxController {
	
	@Autowired
	HoaxService hoaxService;

	@PostMapping("/hoaxes")
	void createHoax(@RequestBody Hoax hoax) {
		hoaxService.save(hoax);
	}
	
}
