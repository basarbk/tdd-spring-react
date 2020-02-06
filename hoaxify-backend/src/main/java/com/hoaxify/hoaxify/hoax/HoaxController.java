package com.hoaxify.hoaxify.hoax;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	ResponseEntity<?> getHoaxesRelative(@PathVariable long id, Pageable pageable,
			@RequestParam(name="direction", defaultValue="after") String direction,
			@RequestParam(name="count", defaultValue="false", required=false) boolean count
			) {
		if(!direction.equalsIgnoreCase("after")) {			
			return ResponseEntity.ok(hoaxService.getOldHoaxes(id, pageable).map(HoaxVM::new));
		}
		
		if(count == true) {
			long newHoaxCount = hoaxService.getNewHoaxesCount(id);
			return ResponseEntity.ok(Collections.singletonMap("count", newHoaxCount));
		}
		
		List<HoaxVM> newHoaxes = hoaxService.getNewHoaxes(id, pageable).stream()
				.map(HoaxVM::new).collect(Collectors.toList());
		return ResponseEntity.ok(newHoaxes);
	}
	
	@GetMapping("/users/{username}/hoaxes/{id:[0-9]+}")
	ResponseEntity<?> getHoaxesRelativeForUser(@PathVariable String username, @PathVariable long id, Pageable pageable,
			@RequestParam(name="direction", defaultValue="after") String direction,
			@RequestParam(name="count", defaultValue="false", required=false) boolean count
			) {
		if(!direction.equalsIgnoreCase("after")) {			
			return ResponseEntity.ok(hoaxService.getOldHoaxesOfUser(id, username, pageable).map(HoaxVM::new));
		}

		if(count == true) {
			long newHoaxCount = hoaxService.getNewHoaxesCountOfUser(id, username);
			return ResponseEntity.ok(Collections.singletonMap("count", newHoaxCount));
		}
		List<HoaxVM> newHoaxes = hoaxService.getNewHoaxesOfUser(id, username, pageable).stream()
				.map(HoaxVM::new).collect(Collectors.toList());
		return ResponseEntity.ok(newHoaxes);
		
	}
}
