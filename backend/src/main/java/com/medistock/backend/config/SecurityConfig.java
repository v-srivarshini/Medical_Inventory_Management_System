package com.medistock.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.medistock.backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    // ✅ CORS Configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "https://medical-inventory-management-system-six.vercel.app",
        "https://medical-inventory-git-b12f1a-srivarshinivuchuru-1364s-projects.vercel.app",
       "https://medical-inventory-management-system-7gd4wveaf.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }



@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {

    http
        .cors(cors -> {})
        .csrf(csrf -> csrf.disable())

        .sessionManagement(session ->
            session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
            )
        )

        .authorizeHttpRequests(auth -> auth

        // Public APIs
        .requestMatchers("/api/auth/**")
        .permitAll()
        .requestMatchers("/api/email/**")
.permitAll()


      // =========================
// USERS
// Admin only
// =========================

.requestMatchers("/api/users/**")
.hasAuthority("Admin")

// =========================
// SUPPLIERS
// Admin -> CRUD
// Pharmacist -> View
// =========================

.requestMatchers("/api/suppliers/create/**")
.hasAuthority("Admin")

.requestMatchers("/api/suppliers/update/**")
.hasAuthority("Admin")

.requestMatchers("/api/suppliers/delete/**")
.hasAuthority("Admin")

.requestMatchers("/api/suppliers/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist"
)


// =========================
// MEDICINES
// Admin -> CRUD
// Pharmacist -> CRUD
// Staff -> View
// =========================

.requestMatchers(HttpMethod.POST, "/api/medicines")
.hasAnyAuthority(
        "Admin",
        "Pharmacist"
)

.requestMatchers(HttpMethod.PUT, "/api/medicines/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist"
)

.requestMatchers(HttpMethod.DELETE, "/api/medicines/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist"
)

.requestMatchers(HttpMethod.GET, "/api/medicines/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist",
        "Staff"
)

// =========================
// INVENTORY
// Admin -> CRUD
// Pharmacist -> View + Update
// Staff -> View
// =========================

.requestMatchers(HttpMethod.POST, "/api/inventory")
.hasAnyAuthority(
        "Admin",
        "Pharmacist"
)

.requestMatchers(HttpMethod.PUT, "/api/inventory/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist",
        "Staff"
)

.requestMatchers(HttpMethod.DELETE, "/api/inventory/**")
.hasAuthority("Admin")

.requestMatchers(HttpMethod.GET, "/api/inventory/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist",
        "Staff"
)


// =========================
// PURCHASE ORDERS
// Admin + Pharmacist
// =========================

.requestMatchers("/api/purchase-orders/**")
.hasAnyAuthority(
        "Admin",
        "Pharmacist"
)



        // =========================
        // REPORTS
        // Admin + Pharmacist View/Generate
        // Delete only Admin
        // =========================

        .requestMatchers("/api/reports/delete/**")
        .hasAuthority("Admin")

        .requestMatchers("/api/reports/**")
        .hasAnyAuthority(
                "Admin",
                "Pharmacist"
        )


        // =========================
        // NOTIFICATIONS
        // Everyone
        // =========================

        .requestMatchers("/api/notifications/**")
        .hasAnyAuthority(
                "Admin",
                "Pharmacist",
                "Staff"
        )


        // Dashboard
        .requestMatchers("/api/dashboard/**")
        .hasAnyAuthority(
                "Admin",
                "Pharmacist",
                "Staff"
        )


        .anyRequest()
        .authenticated());


    http.addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
    );


    return http.build();
}



}
