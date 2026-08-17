// package com.medistock.backend.controller;

// import java.util.HashMap;
// import java.util.Map;

// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.bind.annotation.RequestParam;
// import com.medistock.backend.dto.DashboardDTO;
// import com.medistock.backend.repository.ExpiryTrackingRepository;
// import com.medistock.backend.repository.InventoryRepository;
// import com.medistock.backend.repository.MedicineRepository;
// import com.medistock.backend.repository.NotificationRepository;
// import com.medistock.backend.repository.PurchaseOrderRepository;
// import com.medistock.backend.repository.StockLogRepository;
// import com.medistock.backend.repository.SupplierRepository;
// import com.medistock.backend.repository.UserRepository;
// import com.medistock.backend.service.DashboardService;
// import org.springframework.beans.factory.annotation.Autowired;

// @RestController
// @RequestMapping("/api/dashboard")
// @CrossOrigin(origins = "http://localhost:5173")
// public class DashboardController {

//     private final DashboardService dashboardService;
//     private final UserRepository userRepository;
//     private final MedicineRepository medicineRepository;
//     private final SupplierRepository supplierRepository;
//     private final InventoryRepository inventoryRepository;
//     private final PurchaseOrderRepository purchaseOrderRepository;
//     private final StockLogRepository stockLogRepository;
//     private final ExpiryTrackingRepository expiryTrackingRepository;
//     private final NotificationRepository notificationRepository;

//     @Autowired
//     public DashboardController(DashboardService dashboardService,
//             UserRepository userRepository,
//             MedicineRepository medicineRepository,
//             SupplierRepository supplierRepository,
//             InventoryRepository inventoryRepository,
//             PurchaseOrderRepository purchaseOrderRepository,
//             StockLogRepository stockLogRepository,
//             ExpiryTrackingRepository expiryTrackingRepository,
//             NotificationRepository notificationRepository) {
//         this.dashboardService = dashboardService;
//         this.userRepository = userRepository;
//         this.medicineRepository = medicineRepository;
//         this.supplierRepository = supplierRepository;
//         this.inventoryRepository = inventoryRepository;
//         this.purchaseOrderRepository = purchaseOrderRepository;
//         this.stockLogRepository = stockLogRepository;
//         this.expiryTrackingRepository = expiryTrackingRepository;
//         this.notificationRepository = notificationRepository;
//     }

//     @GetMapping

// public Map<String, Object> getDashboardData() {

//     Map<String, Object> data = new HashMap<>();

//     data.put("users", userRepository.count());
//     data.put("medicines", medicineRepository.count());
//     data.put("suppliers", supplierRepository.count());
//     data.put("inventory", inventoryRepository.count());
//     data.put("purchaseOrders", purchaseOrderRepository.count());
//     data.put("stockLogs", stockLogRepository.count());

//         data.put("lowStock",
//             inventoryRepository.countByQuantityAvailableLessThanEqualMinimumStock());

//         data.put("expiryAlerts",
//             expiryTrackingRepository.countByStatus("EXPIRING_SOON"));

//         data.put("notifications",
//             notificationRepository.countByUser_UserIdAndIsReadFalse(1));

//     return data;
// }
//     // Admin Dashboard
//     @GetMapping("/admin")
//     public DashboardDTO getAdminDashboard() {
//         return dashboardService.getAdminDashboard();
//     }

//     // Inventory Dashboard
//     @GetMapping("/inventory")
//     public DashboardDTO getInventoryDashboard() {
//         return dashboardService.getInventoryDashboard();
//     }

//     // Pharmacist Dashboard
//     @GetMapping("/pharmacist")
//     public DashboardDTO getPharmacistDashboard() {
//         return dashboardService.getPharmacistDashboard();
//     }
    
// }

package com.medistock.backend.controller;

import java.util.Map;

//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medistock.backend.dto.DashboardDTO;
import com.medistock.backend.service.DashboardService;
import com.medistock.backend.service.RoleDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://medical-inventory-management-system-six.vercel.app")
public class DashboardController {

    private final DashboardService dashboardService;
    private final RoleDashboardService roleDashboardService;

    /**
     * Role-aware dashboard data — returns exactly the fields each frontend
     * dashboard page (Admin/Pharmacist/Staff) is already reading.
     *
     * NOTE: role/userId are passed as query params rather than resolved from
     * the JWT principal. Nothing else in this codebase currently resolves the
     * authenticated user from the Spring Security context — notifications,
     * stock logs, reports etc. are all still created with a hardcoded
     * userId=1. Once that's wired up (e.g. via @AuthenticationPrincipal),
     * this can switch to reading the user from the token instead of a param.
     *
     * Frontend calls:
     *   GET /api/dashboard?role=ADMIN
     *   GET /api/dashboard?role=PHARMACIST&userId=5
     *   GET /api/dashboard?role=STAFF
     */
    @GetMapping
    public Map<String, Object> getDashboardData(
            @RequestParam(defaultValue = "Admin") String role,
            @RequestParam(required = false) Integer userId) {

        String normalized = role == null ? "Admin" : role.trim().toUpperCase();

        switch (normalized) {
            case "Pharmacist":
                return roleDashboardService.getPharmacistDashboard(userId);
            case "Staff":
                return roleDashboardService.getStaffDashboard();
            case "Admin":
            default:
                return roleDashboardService.getAdminDashboard();
        }
    }

    // Admin Dashboard — existing lightweight summary, unchanged
    @GetMapping("/admin")
    public DashboardDTO getAdminDashboard() {
        return dashboardService.getAdminDashboard();
    }

    // Inventory Dashboard — existing, unchanged
    @GetMapping("/inventory")
    public DashboardDTO getInventoryDashboard() {
        return dashboardService.getInventoryDashboard();
    }

    // Pharmacist Dashboard — existing lightweight summary, unchanged
    @GetMapping("/pharmacist")
    public DashboardDTO getPharmacistDashboard() {
        return dashboardService.getPharmacistDashboard();
    }

}
