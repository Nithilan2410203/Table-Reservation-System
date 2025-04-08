#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MENU_FILE "menu.txt"
#define RESERVATION_FILE "reservations.txt"
#define MESSAGE_FILE "messages.txt"

#define ADMIN_ID "admin"
#define ADMIN_PASS "admin123"
#define USER_ID "user"
#define USER_PASS "user123"

// Structure for table reservation
typedef struct Reservation {
    char customerName[50];
    char email[50];
    int numGuests;
    char date[15];
    char time[10];
    struct Reservation *next;
} Reservation;

Reservation *head = NULL;

// Function to validate email format
int isValidEmail(char *email) {
    if (!(strchr(email, '@') && strchr(email, '.'))) {
        printf("==>Error: Invalid email format. Please enter a valid email.\n");
        return 0;
    }
    return 1;
}

// Function to validate date format (DD/MM/YYYY)
int isValidDate(char *date) {
    if (strlen(date) != 10 || date[2] != '/' || date[5] != '/') {
        printf("==>Error: Invalid date format. Use DD/MM/YYYY.\n");
        return 0;
    }
    for (int i = 0; i < 10; i++) {
        if (i == 2 || i == 5) continue;
        if (!isdigit(date[i])) {
            printf("==>Error: Date must contain only numbers.\n");
            return 0;
        }
    }
    return 1;
}

// Function to validate time format (HH:MM)
int isValidTime(char *time) {
    if (strlen(time) != 5 || time[2] != ':') {
        printf("==>Error: Invalid time format. Use HH:MM.\n");
        return 0;
    }
    for (int i = 0; i < 5; i++) {
        if (i == 2) continue;
        if (!isdigit(time[i])) {
            printf("==>Error: Time must contain only numbers.\n");
            return 0;
        }
    }
    if (!(strcmp(time, "10:00") >= 0 && strcmp(time, "22:00") <= 0)) {
        printf("==>Error: Time must be between 10:00 and 22:00.\n");
        return 0;
    }
    return 1;
}

// Function to add reservation
void addReservation(char *name, char *email, int guests, char *date, char *time) {
    if (!isValidEmail(email)) {
        printf("Invalid email format. Please try again.\n");
        return;
    }
    if (!isValidDate(date)) {
        printf("Invalid date format. Use DD/MM/YYYY.\n");
        return;
    }
    if (!isValidTime(time)) {
        printf("Invalid time. Use HH:MM between 10:00 and 22:00.\n");
        return;
    }
    if (guests <= 0) {
        printf("Number of guests must be positive.\n");
        return;
    }
    
    Reservation *newReservation = (Reservation *)malloc(sizeof(Reservation));
    strcpy(newReservation->customerName, name);
    strcpy(newReservation->email, email);
    newReservation->numGuests = guests;
    strcpy(newReservation->date, date);
    strcpy(newReservation->time, time);
    newReservation->next = head;
    head = newReservation;
    printf("Reservation confirmed for %s on %s at %s for %d guests.\n", name, date, time, guests);
    
    FILE *file = fopen(RESERVATION_FILE, "a");
    fprintf(file, "%s %s %d %s %s\n", name, email, guests, date, time);
    fclose(file);
}


// Function to display reservations in a properly aligned table
void displayReservations() {
    FILE *file = fopen(RESERVATION_FILE, "r");
    char name[50], email[50], date[15], time[10];
    int guests;
    if (file == NULL) {
        printf("No reservations found.\n");
        return;
    }
    printf("\n--------------------------------------------------------------------------------\n");
    printf("| %-20s | %-25s | %-6s | %-12s | %-5s |\n", "Name", "Email", "Guests", "Date", "Time");
    printf("--------------------------------------------------------------------------------\n");
    while (fscanf(file, "%s %s %d %s %s", name, email, &guests, date, time) != EOF) {
        printf("| %-20s | %-25s | %-6d | %-12s | %-s |\n", name, email, guests, date, time);
    }
    printf("--------------------------------------------------------------------------------\n");
    fclose(file);
}

// Function to cancel a reservation
void cancelReservation() {
    FILE *file = fopen(RESERVATION_FILE, "r");
    if (!file) {
        printf("No reservations found.\n");
        return;
    }
    
    FILE *tempFile = fopen("temp.txt", "w");
    char name[50], date[15], time[10], email[50], resName[50], resDate[15], resTime[10];
    int guests, found = 0;
    
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\n")] = 0;
    printf("Enter reservation date (DD/MM/YYYY): ");
    fgets(date, sizeof(date), stdin);
    date[strcspn(date, "\n")] = 0;
    
    while (fscanf(file, "%49s %49s %d %14s %9s", resName, email, &guests, resDate, resTime) != EOF) {
        if (strcmp(name, resName) == 0 && strcmp(date, resDate) == 0) {
            found = 1;
            continue;
        }
        fprintf(tempFile, "%s %s %d %s %s\n", resName, email, guests, resDate, resTime);
    }
    fclose(file);
    fclose(tempFile);
    
    remove(RESERVATION_FILE);
    rename("temp.txt", RESERVATION_FILE);
    
    if (found) {
        printf("Reservation cancelled successfully.\n");
    } else {
        printf("Reservation not found.\n");
    }
}

// Function to view menu
void viewMenu() {
    FILE *file = fopen("menu.txt", "r"); // Ensure correct filename
    if (!file) {
        printf("NO ITEMS FOUND\n");
        return;
    }

    printf("\n-----------------------------------------\n");
    printf("| %-20s | %-10s |\n", "Menu Items", "Price");
    printf("-----------------------------------------\n");

    char line[100], item[50];
    float price;
    int found = 0;

    while (fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\n")] = '\0'; // Remove newline

        // Extract price (last word) and item name
        char *lastSpace = strrchr(line, ' ');
        if (lastSpace) {
            *lastSpace = '\0'; // Split name and price
            sscanf(lastSpace + 1, "%f", &price);
            strcpy(item, line);
        } else {
            continue; // Skip invalid lines
        }

        printf("| %-20s | %-10.2f |\n", item, price);
        found = 1;
    }

    if (!found) {
        printf("NO ITEMS FOUND\n");
    }

    printf("-----------------------------------------\n");
    fclose(file);
}



// Function to modify menu
void modifyMenu() {
    FILE *file = fopen(MENU_FILE, "w");
    if (!file) {
        printf("Error opening menu file!\n");
        return;
    }
    char item[50];
    char line[50];
    float price;
    printf("Enter new menu items with prices (type END to stop):\n");
    while (1) {
        printf("Item Name: ");
        fgets(item,sizeof(item),stdin);
        item[strcspn(item, "\n")] = '\0';
        if (strcmp(item, "END") == 0) break;
        printf("Price: ");
        fgets(line , sizeof(line), stdin); 
        sscanf(line, "%f", &price);
        fprintf(file, "%s %.2f\n", item, price);
    }
    fclose(file);
    printf("Menu updated successfully!\n");
}

// Function to authenticate user/admin
int authenticate(char role) {
    char id[20], pass[20];
    printf("Enter ID: ");
    scanf("%s", id);
    printf("Enter Password: ");
    scanf("%s", pass);
    
    if ((role == 'A' && strcmp(id, ADMIN_ID) == 0 && strcmp(pass, ADMIN_PASS) == 0) ||
        (role == 'U' && strcmp(id, USER_ID) == 0 && strcmp(pass, USER_PASS) == 0)) {
        return 1;
    }
    printf("Invalid credentials. Access denied.\n");
    return 0;
}

// Function to send messages (User)
void sendMessage() {
    FILE *file = fopen(MESSAGE_FILE, "a");
    char name[50], message[200];
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\n")] = 0;  // Remove newline character
    printf("Enter your message to admin: ");
    fgets(message, sizeof(message), stdin);
    fprintf(file, "Message from %s: %s", name, message);
    fclose(file);
    printf("Message sent successfully!\n");
}


// Function to view messages (Admin)
void viewMessages() {
    FILE *file = fopen(MESSAGE_FILE, "r");
    char line[250];
    if (file == NULL) {
        printf("No messages found.\n");
        return;
    }
    printf("\nMessages from Users:\n");
    printf("----------------------------------\n");
    while (fgets(line, sizeof(line), file)) {
        printf("%s", line);
    }
    printf("----------------------------------\n");
    fclose(file);
}


int main() {
    int choice, guests;
    char name[50], email[50], date[15], time[10];
    char role;
    
    printf("====================WELCOME====================\n");
    printf("================MR PANDIAN HOTEL===============\n");
    
    while (1) {
        printf("Login as (U for User / A for Admin): ");
        scanf(" %c", &role);
        getchar();
    
        if (role != 'U' && role != 'A' && role != 'u' && role != 'a') {
            printf("Invalid role. Exiting...\n");
            return 0;
        }

        if (!authenticate(toupper(role))) {
            continue;
        }        
    
        while (1) {
            printf("\nHotel Table Reservation System\n");
            if (toupper(role) == 'U') {
                printf("1. Book Reservation\n2. View Menu\n3. Send Message to Admin\n4. Cancel Reservation\n5. Logout\n");
            } else {
                printf("1. View Reservations\n2. Modify Menu\n3. View Messages\n4. Cancel Reservation\n5. Logout\n");
            }
            printf("Enter your choice: ");
            scanf("%d", &choice);
            getchar();
    
            if (toupper(role) == 'U') {
                switch (choice) {
                    case 1:
                        printf("Enter your name: ");
                        fgets(name, sizeof(name), stdin);
                        name[strcspn(name, "\n")] = 0;
                        do {
                            printf("Enter your email: ");
                            fgets(email, sizeof(email), stdin);
                            email[strcspn(email, "\n")] = 0;
                        } while (!isValidEmail(email));
                        do {
                            printf("Enter number of guests: ");
                            scanf("%d", &guests);
                            getchar();
                        } while (guests <= 0);
                        do {
                            printf("Enter reservation date (DD/MM/YYYY): ");
                            fgets(date, sizeof(date), stdin);
                            date[strcspn(date, "\n")] = 0;
                        } while (!isValidDate(date));
                        do {
                            printf("Enter reservation time (10:00-22:00): ");
                            fgets(time, sizeof(time), stdin);
                            time[strcspn(time, "\n")] = 0;
                        } while (!isValidTime(time));
                        addReservation(name, email, guests, date, time);
                        break;
                    case 2:
                        viewMenu();
                        break;
                    case 3:
                        sendMessage();
                        break;
                    case 4:
                        cancelReservation();
                        break;
                    case 5:
                        printf("Logging out...\n");
                        goto relogin;
                    default:
                        printf("Invalid choice.\n");
                }
            } else {
                switch (choice) {
                    case 1:
                        displayReservations();
                        break;
                    case 2:
                        modifyMenu();
                        break;
                    case 3:
                        viewMessages();
                        break;
                    case 4:
                        cancelReservation();
                        break;
                    case 5:
                        printf("Logging out...\n");
                        goto relogin;
                    default:
                        printf("Invalid choice.\n");
                }
            }
        }
    relogin:
        printf("Do you want to login again? (Y/N): ");
        char again;
        scanf(" %c", &again);
        getchar();
        if (again == 'N' || again == 'n') {
            printf("Exiting system...\n");
            return 0;
        }
    }
}