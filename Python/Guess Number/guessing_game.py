#!/usr/bin/env python3
"""
Your First Python App: Number Guessing Game
===========================================

This game demonstrates fundamental Python concepts:
- Variables and data types
- Functions and return values
- Loops (while)
- Conditionals (if/elif/else)
- User input and output
- Random number generation
- Exception handling
- String formatting
"""

import random
import sys


def display_welcome():
    """Display a welcome message to the player."""
    print("=" * 50)
    print("🎯 WELCOME TO THE NUMBER GUESSING GAME! 🎯")
    print("=" * 50)
    print("I'm thinking of a number between 1 and 100.")
    print("Can you guess what it is?")
    print("=" * 50)


def get_difficulty_level():
    """Ask the player to choose a difficulty level."""
    print("\nChoose your difficulty level:")
    print("1. Easy (10 attempts)")
    print("2. Medium (7 attempts)")
    print("3. Hard (5 attempts)")
    
    while True:
        try:
            choice = int(input("\nEnter your choice (1-3): "))
            if choice == 1:
                return 10, "Easy"
            elif choice == 2:
                return 7, "Medium"
            elif choice == 3:
                return 5, "Hard"
            else:
                print("Please enter 1, 2, or 3!")
        except ValueError:
            print("Please enter a valid number!")


def get_player_guess(attempt_num, max_attempts):
    """Get a valid guess from the player."""
    while True:
        try:
            prompt = f"Attempt {attempt_num}/{max_attempts} - Enter your guess (1-100): "
            guess = int(input(prompt))
            
            if 1 <= guess <= 100:
                return guess
            else:
                print("Please enter a number between 1 and 100!")
                
        except ValueError:
            print("Please enter a valid number!")


def give_hint(guess, secret_number, attempts_left):
    """Provide helpful hints to the player."""
    difference = abs(guess - secret_number)
    
    if difference <= 5:
        print("🔥 You're very close!")
    elif difference <= 15:
        print("🌡️  You're getting warm!")
    elif difference <= 30:
        print("❄️  You're getting cold!")
    else:
        print("🧊 You're freezing cold!")
    
    # Give additional hints based on attempts left
    if attempts_left <= 2:
        if secret_number % 2 == 0:
            print("💡 Hint: The number is even!")
        else:
            print("💡 Hint: The number is odd!")


def play_game():
    """Main game logic."""
    # Game setup
    secret_number = random.randint(1, 100)
    max_attempts, difficulty = get_difficulty_level()
    
    print(f"\n🎮 Starting game on {difficulty} mode!")
    print(f"You have {max_attempts} attempts to guess my number.")
    
    # Initialize game variables
    attempts_used = 0
    game_won = False
    guesses_made = []
    
    # Main game loop
    while attempts_used < max_attempts:
        attempts_used += 1
        attempts_left = max_attempts - attempts_used
        
        # Get player's guess
        guess = get_player_guess(attempts_used, max_attempts)
        guesses_made.append(guess)
        
        # Check if guess is correct
        if guess == secret_number:
            print(f"\n🎉 CONGRATULATIONS! 🎉")
            print(f"You guessed it! The number was {secret_number}")
            print(f"You won in {attempts_used} attempts!")
            game_won = True
            break
        
        # Give feedback for incorrect guesses
        elif guess < secret_number:
            print("📈 Too low!")
        else:
            print("📉 Too high!")
        
        # Give hints if not the last attempt
        if attempts_left > 0:
            give_hint(guess, secret_number, attempts_left)
            print(f"Attempts remaining: {attempts_left}")
            
            # Show previous guesses if player has made multiple attempts
            if len(guesses_made) > 1:
                print(f"Your previous guesses: {', '.join(map(str, guesses_made))}")
        
        print("-" * 30)
    
    # Game over - check if player won or lost
    if not game_won:
        print(f"\n💔 Game Over!")
        print(f"The number I was thinking of was: {secret_number}")
        print("Better luck next time!")
    
    # Show game statistics
    print(f"\n📊 Game Statistics:")
    print(f"   • Difficulty: {difficulty}")
    print(f"   • Attempts used: {attempts_used}/{max_attempts}")
    print(f"   • All your guesses: {', '.join(map(str, guesses_made))}")


def play_again():
    """Ask if the player wants to play another round."""
    while True:
        choice = input("\nWould you like to play again? (yes/no): ").lower().strip()
        if choice in ['yes', 'y', 'yeah', 'yep']:
            return True
        elif choice in ['no', 'n', 'nope']:
            return False
        else:
            print("Please enter 'yes' or 'no'")


def main():
    """Main function that runs the entire application."""
    display_welcome()
    
    # Main application loop
    while True:
        try:
            play_game()
            
            if not play_again():
                print("\n👋 Thanks for playing! Happy Python learning!")
                break
                
        except KeyboardInterrupt:
            print("\n\n👋 Thanks for playing! Goodbye!")
            sys.exit(0)


# This is a Python idiom that means "run this code only if this file 
# is executed directly, not if it's imported as a module"
if __name__ == "__main__":
    main()