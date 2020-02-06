package com.hoaxify.hoaxify.hoax;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hoaxify.hoaxify.hoax.vm.HoaxVM;
import com.hoaxify.hoaxify.shared.CurrentUser;
import com.hoaxify.hoaxify.user.User;

@RestController
@RequestMapping("/api/1.0")
public class HoaxController {
	
	@Autowired
	HoaxService hoaxService;

	@PostMapping("/hoaxes")
	HoaxVM createHoax(@Valid @RequestBody Hoax hoax, @CurrentUser User user) {
		return new HoaxVM(hoaxService.save(user, hoax));
	}
	
	@GetMapping("/hoaxes")
	Page<HoaxVM> getAllHoaxes(Pageable pageable) {
		return hoaxService.getAllHoaxes(pageable).map(HoaxVM::new);
	}
	
	@GetMapping("/users/{username}/hoaxes")
	Page<HoaxVM> getHoaxesOfUser(@PathVariable String username, Pageable pageable) {
		return hoaxService.getHoaxesOfUser(username, pageable).map(HoaxVM::new);
		
	}
	
	@GetMapping("/hoaxes/{id:[0-9]+}")
	Page<?> getHoaxesRelative(@PathVariable long id, Pageable pageable) {
		return hoaxService.getOldHoaxes(id, pageable).map(HoaxVM::new);
	}
}
