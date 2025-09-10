package com.example.GreenPath.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.Collection;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final DataSource dataSource;
    
    @Value("${app.security.remember-me.key}")
    private String rememberMeKey;
    
    @Value("${app.security.remember-me.token-validity-seconds}")
    private int rememberMeTokenValiditySeconds;

    public SecurityConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
        .authorizeHttpRequests(authz -> authz
            // Static resources first
            .requestMatchers("/", "/login", "/signup", "/user/signup","/css/**", "/js/**", "/images/**", "/favicon.ico","/user/verify-code","/user/resend-code","/user/cancel-registration").permitAll()
            // Role-based access
            .requestMatchers("/farmer/**").hasRole("FARMER")
            .requestMatchers("/herder/**").hasRole("HERDER")
            .requestMatchers("/admin/**").hasRole("ADMIN")
            // WebSocket endpoints
            .requestMatchers("/ws/**").authenticated()
            // All other requests require authentication
            .anyRequest().authenticated()
        )
            
            // Form login configuration
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/perform-login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler(authenticationSuccessHandler())
                .failureUrl("/login?error=true")
                .permitAll()
            )
            
            // Remember Me configuration - Spring will auto-detect UserDetailsService
            .rememberMe(remember -> remember
                .key(rememberMeKey)
                .tokenRepository(persistentTokenRepository())
                .tokenValiditySeconds(rememberMeTokenValiditySeconds)
                // Removed explicit userDetailsService - Spring will find your @Service automatically
                .rememberMeParameter("remember-me")
                .rememberMeCookieName("remember-me-cookie")
            )
            
            // Logout configuration
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .deleteCookies("JSESSIONID", "remember-me-cookie")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .permitAll()
            )
            
            // Session management
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .expiredUrl("/login?expired=true")
                .sessionRegistry(sessionRegistry())
            )
            
            // CSRF configuration
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/ws/**","/user/signup", "/user/verify-code", "/user/resend-code", "/user/cancel-registration") // Disable CSRF for major endpoints
            )
            
            // Headers configuration
            .headers(headers -> headers
                .frameOptions().sameOrigin()  // Allow frames from same origin (for H2 console)
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                )
            );

        return http.build();
    }
 
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public PersistentTokenRepository persistentTokenRepository() {
        JdbcTokenRepositoryImpl tokenRepository = new JdbcTokenRepositoryImpl();
        tokenRepository.setDataSource(dataSource);
        tokenRepository.setCreateTableOnStartup(false); // Set to false after first run
        return tokenRepository;
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

    @Bean
    public org.springframework.security.core.session.SessionRegistry sessionRegistry() {
        return new org.springframework.security.core.session.SessionRegistryImpl();
    }


    // Custom success handler to redirect based on user type
   public static class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        // Read the selected role from login form
        String chosenRole = request.getParameter("role");
        
        // Get user's actual roles from Spring Security
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        String targetUrl;
        
        if (chosenRole != null && !chosenRole.isEmpty()) {
            // Convert role to Spring Security format if needed
            String roleWithPrefix = chosenRole.startsWith("ROLE_") ? chosenRole : "ROLE_" + chosenRole.toUpperCase();
            
            // Check if the user actually has that role
            boolean hasRole = authorities.stream()
                    .anyMatch(auth -> auth.getAuthority().equals(roleWithPrefix));

            if (hasRole) {
                // User has the chosen role, redirect accordingly
                targetUrl = switch (roleWithPrefix) {
                    case "ROLE_FARMER" -> "/farmer/dashboard";
                    case "ROLE_HERDER" -> "/herder/dashboard"; 
                    case "ROLE_ADMIN" -> "/admin/dashboard";
                    default -> "/dashboard";
                };
            } else {
                // User doesn't have the chosen role, redirect to error or default
                targetUrl = "/login?error=invalid_role";
            }
        } else {
            // No role specified, determine based on user's highest privilege role
            targetUrl = determineDefaultRedirectUrl(authorities);
        }

        // Store the chosen role in session for later use if needed
        HttpSession session = request.getSession();
        session.setAttribute("currentRole", chosenRole);

        // Redirect to target URL
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
    
    /**
     * Determines default redirect URL based on user's roles when no specific role is chosen
     */
    private String determineDefaultRedirectUrl(Collection<? extends GrantedAuthority> authorities) {
        // Priority order: ADMIN > FARMER > HERDER
        if (authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            return "/admin/dashboard";
        } else if (authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_FARMER"))) {
            return "/farmer/dashboard";
        } else if (authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_HERDER"))) {
            return "/herder/dashboard";
        } else {
            return "/dashboard";
        }
    }
}

}