package com.hoaxify.hoaxify.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf().disable();
		
		http.headers().disable();

		http.httpBasic().authenticationEntryPoint(new BasicAuthenticationEntryPoint());
		
		http
			.authorizeRequests()
				.antMatchers(HttpMethod.POST, "/api/1.0/login").authenticated()
				.antMatchers(HttpMethod.PUT, "/api/1.0/users/{id:[0-9]+}").authenticated()
				.antMatchers(HttpMethod.POST, "/api/1.0/hoaxes/**").authenticated()
				.antMatchers(HttpMethod.DELETE, "/api/1.0/hoaxes/{id:[0-9]+}").authenticated()
			.and()
			.authorizeRequests().anyRequest().permitAll();
		
		http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
