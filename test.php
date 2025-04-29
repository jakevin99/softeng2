
<?php

// IMPORTANT: Initialize current_count = 0 *before* this loop starts.
// The variable needs to retain its value between loop iterations.
$current_count = 0;

// Use PHP 'true' for the infinite loop condition
while (true) {

    // Get the number of people entering during this interval
    // Input is read from standard input
    $entry_input = readline("Enter the entry: ");

    // Validate if the input is a valid integer.
    // filter_var checks if the string represents an integer.
    if (filter_var($entry_input, FILTER_VALIDATE_INT) === false) {
        echo "Invalid input for entry. Please enter a number.\n";
        continue; // Skip to the next iteration
    }
    // Convert the validated input string to an integer
    $entry = intval($entry_input);


    // Get the number of people exiting during this interval
    // Input is read from standard input
    // Using '$exit_count' to avoid potential conflicts if 'exit' were used differently.
    $exit_input = readline("Enter the exit: ");

    // Validate if the input is a valid integer.
    if (filter_var($exit_input, FILTER_VALIDATE_INT) === false) {
        echo "Invalid input for exit. Please enter a number.\n";
        continue; // Skip to the next iteration
    }
    // Convert the validated input string to an integer
    $exit_count = intval($exit_input);


    // Calculate the net change in people for this interval.
    // This happens regardless of whether entry > exit_count or not.
    $net_change = $entry - $exit_count;

    // Update the current count by adding the net change.
    // This accumulates the count correctly across all iterations.
    $current_count += $net_change;

    // Ensure the count does not go below zero.
    // A negative count of people doesn't make physical sense.
    if ($current_count < 0) {
        $current_count = 0; // Reset to zero if it becomes negative
    }

    // Print the updated current count in every iteration.
    // Using printf for formatted output, similar to Python's f-string. Added newline (\n).
    printf("Current count: %d\n", $current_count);

    // The logic now correctly handles all cases:
    // - If entry > exit_count, net_change is positive, current_count increases.
    // - If entry < exit_count, net_change is negative, current_count decreases (but not below 0).
    // - If entry == exit_count, net_change is zero, current_count remains unchanged.

} // End of while loop

// Note: This script, when run, creates an infinite loop.
// It needs to be manually stopped (e.g., using Ctrl+C in the terminal).
?>



