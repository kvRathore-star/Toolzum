"use client";
import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { SmilePlus, Image, Type as TypeIcon, Download, Copy } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

const EMOJIS = [
  // Smileys
  { e: '😀', n: 'Grinning Face', c: 'Smileys' }, { e: '😃', n: 'Grinning Face with Big Eyes', c: 'Smileys' },
  { e: '😄', n: 'Grinning Face with Smiling Eyes', c: 'Smileys' }, { e: '😁', n: 'Beaming Face with Smiling Eyes', c: 'Smileys' },
  { e: '😆', n: 'Grinning Squinting Face', c: 'Smileys' }, { e: '😅', n: 'Grinning Face with Sweat', c: 'Smileys' },
  { e: '🤣', n: 'Rolling on the Floor Laughing', c: 'Smileys' }, { e: '😂', n: 'Face with Tears of Joy', c: 'Smileys' },
  { e: '🙂', n: 'Slightly Smiling Face', c: 'Smileys' }, { e: '🙃', n: 'Upside-Down Face', c: 'Smileys' },
  { e: '😉', n: 'Winking Face', c: 'Smileys' }, { e: '😊', n: 'Smiling Face with Smiling Eyes', c: 'Smileys' },
  { e: '😇', n: 'Smiling Face with Halo', c: 'Smileys' }, { e: '🥰', n: 'Smiling Face with Hearts', c: 'Smileys' },
  { e: '😍', n: 'Smiling Face with Heart-Eyes', c: 'Smileys' }, { e: '🤩', n: 'Star-Struck', c: 'Smileys' },
  { e: '😘', n: 'Face Blowing a Kiss', c: 'Smileys' }, { e: '😗', n: 'Kissing Face', c: 'Smileys' },
  { e: '😚', n: 'Kissing Face with Closed Eyes', c: 'Smileys' }, { e: '😙', n: 'Kissing Face with Smiling Eyes', c: 'Smileys' },
  { e: '🥲', n: 'Smiling Face with Tear', c: 'Smileys' }, { e: '😋', n: 'Face Savoring Food', c: 'Smileys' },
  { e: '😛', n: 'Face with Tongue', c: 'Smileys' }, { e: '😜', n: 'Winking Face with Tongue', c: 'Smileys' },
  { e: '🤪', n: 'Zany Face', c: 'Smileys' }, { e: '😝', n: 'Squinting Face with Tongue', c: 'Smileys' },
  { e: '🤑', n: 'Money-Mouth Face', c: 'Smileys' }, { e: '🤗', n: 'Hugging Face', c: 'Smileys' },
  { e: '🤭', n: 'Face with Hand Over Mouth', c: 'Smileys' }, { e: '🫢', n: 'Face with Open Eyes and Hand Over Mouth', c: 'Smileys' },
  { e: '🫣', n: 'Face with Peeking Eye', c: 'Smileys' }, { e: '🤫', n: 'Shushing Face', c: 'Smileys' },
  { e: '🤔', n: 'Thinking Face', c: 'Smileys' }, { e: '🫡', n: 'Saluting Face', c: 'Smileys' },
  { e: '🤐', n: 'Zipper-Mouth Face', c: 'Smileys' }, { e: '🤨', n: 'Face with Raised Eyebrow', c: 'Smileys' },
  { e: '😐', n: 'Neutral Face', c: 'Smileys' }, { e: '😑', n: 'Expressionless Face', c: 'Smileys' },
  { e: '😶', n: 'Face Without Mouth', c: 'Smileys' }, { e: '😏', n: 'Smirking Face', c: 'Smileys' },
  { e: '😒', n: 'Unamused Face', c: 'Smileys' }, { e: '🙄', n: 'Face with Rolling Eyes', c: 'Smileys' },
  { e: '😬', n: 'Grimacing Face', c: 'Smileys' }, { e: '😮', n: 'Face with Open Mouth', c: 'Smileys' },
  { e: '😯', n: 'Hushed Face', c: 'Smileys' }, { e: '😲', n: 'Astonished Face', c: 'Smileys' },
  { e: '😳', n: 'Flushed Face', c: 'Smileys' }, { e: '🥺', n: 'Pleading Face', c: 'Smileys' },
  { e: '😢', n: 'Crying Face', c: 'Smileys' }, { e: '😭', n: 'Loudly Crying Face', c: 'Smileys' },
  { e: '😤', n: 'Face with Steam From Nose', c: 'Smileys' }, { e: '😠', n: 'Angry Face', c: 'Smileys' },
  { e: '😡', n: 'Pouting Face', c: 'Smileys' }, { e: '🤬', n: 'Face with Symbols on Mouth', c: 'Smileys' },
  { e: '😈', n: 'Smiling Face with Horns', c: 'Smileys' }, { e: '👿', n: 'Angry Face with Horns', c: 'Smileys' },
  { e: '💀', n: 'Skull', c: 'Smileys' }, { e: '☠️', n: 'Skull and Crossbones', c: 'Smileys' },
  { e: '💩', n: 'Pile of Poo', c: 'Smileys' }, { e: '🤡', n: 'Clown Face', c: 'Smileys' },
  { e: '👹', n: 'Ogre', c: 'Smileys' }, { e: '👺', n: 'Goblin', c: 'Smileys' },
  { e: '👻', n: 'Ghost', c: 'Smileys' }, { e: '👽', n: 'Alien', c: 'Smileys' },
  { e: '🤖', n: 'Robot', c: 'Smileys' }, { e: '😺', n: 'Grinning Cat', c: 'Smileys' },
  { e: '😸', n: 'Grinning Cat with Smiling Eyes', c: 'Smileys' }, { e: '😹', n: 'Cat with Tears of Joy', c: 'Smileys' },
  { e: '😻', n: 'Smiling Cat with Heart-Eyes', c: 'Smileys' }, { e: '😼', n: 'Cat with Wry Smile', c: 'Smileys' },
  { e: '😽', n: 'Kissing Cat', c: 'Smileys' }, { e: '🙀', n: 'Weary Cat', c: 'Smileys' },
  { e: '😿', n: 'Crying Cat', c: 'Smileys' }, { e: '😾', n: 'Pouting Cat', c: 'Smileys' },
  // People
  { e: '👋', n: 'Waving Hand', c: 'People' }, { e: '🤚', n: 'Raised Back of Hand', c: 'People' },
  { e: '🖐️', n: 'Hand with Fingers Splayed', c: 'People' }, { e: '✋', n: 'Raised Hand', c: 'People' },
  { e: '🖖', n: 'Vulcan Salute', c: 'People' }, { e: '👌', n: 'OK Hand', c: 'People' },
  { e: '🤌', n: 'Pinched Fingers', c: 'People' }, { e: '🤏', n: 'Pinching Hand', c: 'People' },
  { e: '✌️', n: 'Victory Hand', c: 'People' }, { e: '🤞', n: 'Crossed Fingers', c: 'People' },
  { e: '🫰', n: 'Hand with Index Finger and Thumb Crossed', c: 'People' },
  { e: '🤟', n: 'Love-You Gesture', c: 'People' }, { e: '🤘', n: 'Sign of the Horns', c: 'People' },
  { e: '🤙', n: 'Call Me Hand', c: 'People' }, { e: '👈', n: 'Backhand Index Pointing Left', c: 'People' },
  { e: '👉', n: 'Backhand Index Pointing Right', c: 'People' }, { e: '👆', n: 'Backhand Index Pointing Up', c: 'People' },
  { e: '🖕', n: 'Middle Finger', c: 'People' }, { e: '👇', n: 'Backhand Index Pointing Down', c: 'People' },
  { e: '☝️', n: 'Index Pointing Up', c: 'People' }, { e: '👍', n: 'Thumbs Up', c: 'People' },
  { e: '👎', n: 'Thumbs Down', c: 'People' }, { e: '✊', n: 'Raised Fist', c: 'People' },
  { e: '👊', n: 'Oncoming Fist', c: 'People' }, { e: '🤛', n: 'Left-Facing Fist', c: 'People' },
  { e: '🤜', n: 'Right-Facing Fist', c: 'People' }, { e: '👏', n: 'Clapping Hands', c: 'People' },
  { e: '🙌', n: 'Raising Hands', c: 'People' }, { e: '🫶', n: 'Heart Hands', c: 'People' },
  { e: '👐', n: 'Open Hands', c: 'People' }, { e: '🤲', n: 'Palms Up Together', c: 'People' },
  { e: '🤝', n: 'Handshake', c: 'People' }, { e: '🙏', n: 'Folded Hands', c: 'People' },
  { e: '✍️', n: 'Writing Hand', c: 'People' }, { e: '💅', n: 'Nail Polish', c: 'People' },
  { e: '🤳', n: 'Selfie', c: 'People' }, { e: '💪', n: 'Flexed Biceps', c: 'People' },
  { e: '🦵', n: 'Leg', c: 'People' }, { e: '🦶', n: 'Foot', c: 'People' },
  { e: '👂', n: 'Ear', c: 'People' }, { e: '👃', n: 'Nose', c: 'People' },
  { e: '🧠', n: 'Brain', c: 'People' }, { e: '🫀', n: 'Anatomical Heart', c: 'People' },
  { e: '👀', n: 'Eyes', c: 'People' }, { e: '👁️', n: 'Eye', c: 'People' },
  { e: '👅', n: 'Tongue', c: 'People' }, { e: '👄', n: 'Mouth', c: 'People' },
  { e: '👶', n: 'Baby', c: 'People' }, { e: '🧒', n: 'Child', c: 'People' },
  { e: '👦', n: 'Boy', c: 'People' }, { e: '👧', n: 'Girl', c: 'People' },
  { e: '🧑', n: 'Person', c: 'People' }, { e: '👨', n: 'Man', c: 'People' },
  { e: '👩', n: 'Woman', c: 'People' }, { e: '🧔', n: 'Bearded Person', c: 'People' },
  { e: '👴', n: 'Old Man', c: 'People' }, { e: '👵', n: 'Old Woman', c: 'People' },
  { e: '🙍', n: 'Person Frowning', c: 'People' }, { e: '🙎', n: 'Person Pouting', c: 'People' },
  { e: '🙅', n: 'Person Gesturing No', c: 'People' }, { e: '🙆', n: 'Person Gesturing OK', c: 'People' },
  { e: '💁', n: 'Person Tipping Hand', c: 'People' }, { e: '🙋', n: 'Person Raising Hand', c: 'People' },
  { e: '🧏', n: 'Deaf Person', c: 'People' }, { e: '🙇', n: 'Person Bowing', c: 'People' },
  { e: '🤦', n: 'Person Facepalming', c: 'People' }, { e: '🤷', n: 'Person Shrugging', c: 'People' },
  { e: '👮', n: 'Police Officer', c: 'People' }, { e: '🕵️', n: 'Detective', c: 'People' },
  { e: '💂', n: 'Guard', c: 'People' }, { e: '🥷', n: 'Ninja', c: 'People' },
  { e: '👷', n: 'Construction Worker', c: 'People' }, { e: '🫅', n: 'Person with Crown', c: 'People' },
  { e: '🤴', n: 'Prince', c: 'People' }, { e: '👸', n: 'Princess', c: 'People' },
  { e: '👳', n: 'Person Wearing Turban', c: 'People' }, { e: '👲', n: 'Person with Skullcap', c: 'People' },
  { e: '🧕', n: 'Woman with Headscarf', c: 'People' }, { e: '🤵', n: 'Person in Tuxedo', c: 'People' },
  { e: '👰', n: 'Person with Veil', c: 'People' }, { e: '🤰', n: 'Pregnant Woman', c: 'People' },
  { e: '🫃', n: 'Pregnant Man', c: 'People' }, { e: '🤱', n: 'Breastfeeding', c: 'People' },
  { e: '👼', n: 'Baby Angel', c: 'People' }, { e: '🎅', n: 'Santa Claus', c: 'People' },
  { e: '🤶', n: 'Mrs. Claus', c: 'People' }, { e: '🦸', n: 'Superhero', c: 'People' },
  { e: '🦹', n: 'Supervillain', c: 'People' }, { e: '🧙', n: 'Mage', c: 'People' },
  { e: '🧚', n: 'Fairy', c: 'People' }, { e: '🧛', n: 'Vampire', c: 'People' },
  { e: '🧜', n: 'Merperson', c: 'People' }, { e: '🧝', n: 'Elf', c: 'People' },
  { e: '🧞', n: 'Genie', c: 'People' }, { e: '🧟', n: 'Zombie', c: 'People' },
  { e: '💆', n: 'Person Getting Massage', c: 'People' }, { e: '💇', n: 'Person Getting Haircut', c: 'People' },
  { e: '🚶', n: 'Person Walking', c: 'People' }, { e: '🧎', n: 'Person Kneeling', c: 'People' },
  { e: '🏃', n: 'Person Running', c: 'People' }, { e: '💃', n: 'Woman Dancing', c: 'People' },
  { e: '🕺', n: 'Man Dancing', c: 'People' }, { e: '🕴️', n: 'Person in Suit Levitating', c: 'People' },
  // Animals & Nature
  { e: '🐶', n: 'Dog Face', c: 'Animals' }, { e: '🐱', n: 'Cat Face', c: 'Animals' },
  { e: '🐭', n: 'Mouse Face', c: 'Animals' }, { e: '🐹', n: 'Hamster', c: 'Animals' },
  { e: '🐰', n: 'Rabbit Face', c: 'Animals' }, { e: '🦊', n: 'Fox', c: 'Animals' },
  { e: '🐻', n: 'Bear', c: 'Animals' }, { e: '🐼', n: 'Panda', c: 'Animals' },
  { e: '🐨', n: 'Koala', c: 'Animals' }, { e: '🐯', n: 'Tiger Face', c: 'Animals' },
  { e: '🦁', n: 'Lion', c: 'Animals' }, { e: '🐮', n: 'Cow Face', c: 'Animals' },
  { e: '🐷', n: 'Pig Face', c: 'Animals' }, { e: '🐸', n: 'Frog', c: 'Animals' },
  { e: '🐵', n: 'Monkey Face', c: 'Animals' }, { e: '🐒', n: 'Monkey', c: 'Animals' },
  { e: '🐔', n: 'Chicken', c: 'Animals' }, { e: '🐧', n: 'Penguin', c: 'Animals' },
  { e: '🐦', n: 'Bird', c: 'Animals' }, { e: '🐤', n: 'Baby Chick', c: 'Animals' },
  { e: '🦅', n: 'Eagle', c: 'Animals' }, { e: '🦉', n: 'Owl', c: 'Animals' },
  { e: '🦇', n: 'Bat', c: 'Animals' }, { e: '🐺', n: 'Wolf', c: 'Animals' },
  { e: '🐗', n: 'Boar', c: 'Animals' }, { e: '🐴', n: 'Horse Face', c: 'Animals' },
  { e: '🦄', n: 'Unicorn', c: 'Animals' }, { e: '🐝', n: 'Honeybee', c: 'Animals' },
  { e: '🦋', n: 'Butterfly', c: 'Animals' }, { e: '🐌', n: 'Snail', c: 'Animals' },
  { e: '🐞', n: 'Lady Beetle', c: 'Animals' }, { e: '🐜', n: 'Ant', c: 'Animals' },
  { e: '🦟', n: 'Mosquito', c: 'Animals' }, { e: '🦠', n: 'Microbe', c: 'Animals' },
  { e: '🐢', n: 'Turtle', c: 'Animals' }, { e: '🐍', n: 'Snake', c: 'Animals' },
  { e: '🦎', n: 'Lizard', c: 'Animals' }, { e: '🐙', n: 'Octopus', c: 'Animals' },
  { e: '🦑', n: 'Squid', c: 'Animals' }, { e: '🦐', n: 'Shrimp', c: 'Animals' },
  { e: '🐬', n: 'Dolphin', c: 'Animals' }, { e: '🐳', n: 'Spouting Whale', c: 'Animals' },
  { e: '🐊', n: 'Crocodile', c: 'Animals' }, { e: '🦈', n: 'Shark', c: 'Animals' },
  { e: '🐅', n: 'Tiger', c: 'Animals' }, { e: '🦍', n: 'Gorilla', c: 'Animals' },
  { e: '🦧', n: 'Orangutan', c: 'Animals' }, { e: '🐘', n: 'Elephant', c: 'Animals' },
  { e: '🦒', n: 'Giraffe', c: 'Animals' }, { e: '🦘', n: 'Kangaroo', c: 'Animals' },
  { e: '🐫', n: 'Camel', c: 'Animals' }, { e: '🦙', n: 'Llama', c: 'Animals' },
  { e: '🌵', n: 'Cactus', c: 'Animals' }, { e: '🌲', n: 'Evergreen Tree', c: 'Animals' },
  { e: '🌳', n: 'Deciduous Tree', c: 'Animals' }, { e: '🌴', n: 'Palm Tree', c: 'Animals' },
  { e: '🌸', n: 'Cherry Blossom', c: 'Animals' }, { e: '🌹', n: 'Rose', c: 'Animals' },
  { e: '🌻', n: 'Sunflower', c: 'Animals' }, { e: '🌺', n: 'Hibiscus', c: 'Animals' },
  { e: '🍀', n: 'Four Leaf Clover', c: 'Animals' }, { e: '🌿', n: 'Herb', c: 'Animals' },
  { e: '🌱', n: 'Seedling', c: 'Animals' }, { e: '🍄', n: 'Mushroom', c: 'Animals' },
  // Food & Drink
  { e: '🍇', n: 'Grapes', c: 'Food' }, { e: '🍈', n: 'Melon', c: 'Food' },
  { e: '🍉', n: 'Watermelon', c: 'Food' }, { e: '🍊', n: 'Tangerine', c: 'Food' },
  { e: '🍋', n: 'Lemon', c: 'Food' }, { e: '🍌', n: 'Banana', c: 'Food' },
  { e: '🍍', n: 'Pineapple', c: 'Food' }, { e: '🥭', n: 'Mango', c: 'Food' },
  { e: '🍎', n: 'Red Apple', c: 'Food' }, { e: '🍏', n: 'Green Apple', c: 'Food' },
  { e: '🍐', n: 'Pear', c: 'Food' }, { e: '🍑', n: 'Peach', c: 'Food' },
  { e: '🍒', n: 'Cherries', c: 'Food' }, { e: '🍓', n: 'Strawberry', c: 'Food' },
  { e: '🫐', n: 'Blueberries', c: 'Food' }, { e: '🥝', n: 'Kiwi', c: 'Food' },
  { e: '🍅', n: 'Tomato', c: 'Food' }, { e: '🥑', n: 'Avocado', c: 'Food' },
  { e: '🍆', n: 'Eggplant', c: 'Food' }, { e: '🥕', n: 'Carrot', c: 'Food' },
  { e: '🌽', n: 'Corn', c: 'Food' }, { e: '🥦', n: 'Broccoli', c: 'Food' },
  { e: '🧄', n: 'Garlic', c: 'Food' }, { e: '🧅', n: 'Onion', c: 'Food' },
  { e: '🥩', n: 'Cut of Meat', c: 'Food' }, { e: '🍗', n: 'Poultry Leg', c: 'Food' },
  { e: '🍔', n: 'Hamburger', c: 'Food' }, { e: '🍟', n: 'French Fries', c: 'Food' },
  { e: '🍕', n: 'Pizza', c: 'Food' }, { e: '🌭', n: 'Hot Dog', c: 'Food' },
  { e: '🥪', n: 'Sandwich', c: 'Food' }, { e: '🌮', n: 'Taco', c: 'Food' },
  { e: '🌯', n: 'Burrito', c: 'Food' }, { e: '🥗', n: 'Green Salad', c: 'Food' },
  { e: '🍜', n: 'Steaming Bowl', c: 'Food' }, { e: '🍝', n: 'Spaghetti', c: 'Food' },
  { e: '🍣', n: 'Sushi', c: 'Food' }, { e: '🍱', n: 'Bento Box', c: 'Food' },
  { e: '🍛', n: 'Curry Rice', c: 'Food' }, { e: '🍦', n: 'Soft Ice Cream', c: 'Food' },
  { e: '🍰', n: 'Shortcake', c: 'Food' }, { e: '🧁', n: 'Cupcake', c: 'Food' },
  { e: '🍩', n: 'Doughnut', c: 'Food' }, { e: '🍪', n: 'Cookie', c: 'Food' },
  { e: '🍫', n: 'Chocolate Bar', c: 'Food' }, { e: '🍬', n: 'Candy', c: 'Food' },
  { e: '☕', n: 'Hot Beverage', c: 'Food' }, { e: '🍵', n: 'Teacup Without Handle', c: 'Food' },
  { e: '🧃', n: 'Beverage Box', c: 'Food' }, { e: '🥤', n: 'Cup with Straw', c: 'Food' },
  { e: '🍺', n: 'Beer Mug', c: 'Food' }, { e: '🍻', n: 'Clinking Beer Mugs', c: 'Food' },
  { e: '🥂', n: 'Clinking Glasses', c: 'Food' }, { e: '🍷', n: 'Wine Glass', c: 'Food' },
  { e: '🥃', n: 'Tumbler Glass', c: 'Food' }, { e: '🍸', n: 'Cocktail Glass', c: 'Food' },
  // Travel & Places
  { e: '🌍', n: 'Globe Showing Europe-Africa', c: 'Travel' },
  { e: '🌎', n: 'Globe Showing Americas', c: 'Travel' },
  { e: '🌏', n: 'Globe Showing Asia-Australia', c: 'Travel' },
  { e: '🗺️', n: 'World Map', c: 'Travel' }, { e: '🏔️', n: 'Snow-Capped Mountain', c: 'Travel' },
  { e: '⛰️', n: 'Mountain', c: 'Travel' }, { e: '🌋', n: 'Volcano', c: 'Travel' },
  { e: '🏖️', n: 'Beach with Umbrella', c: 'Travel' }, { e: '🏜️', n: 'Desert', c: 'Travel' },
  { e: '🏝️', n: 'Desert Island', c: 'Travel' }, { e: '🏛️', n: 'Classical Building', c: 'Travel' },
  { e: '🏗️', n: 'Building Construction', c: 'Travel' }, { e: '🏘️', n: 'Houses', c: 'Travel' },
  { e: '🏙️', n: 'Cityscape', c: 'Travel' }, { e: '🌃', n: 'Night with Stars', c: 'Travel' },
  { e: '🌆', n: 'Cityscape at Dusk', c: 'Travel' }, { e: '🌇', n: 'Sunset', c: 'Travel' },
  { e: '🌉', n: 'Bridge at Night', c: 'Travel' }, { e: '🎠', n: 'Carousel Horse', c: 'Travel' },
  { e: '🎡', n: 'Ferris Wheel', c: 'Travel' }, { e: '🎢', n: 'Roller Coaster', c: 'Travel' },
  { e: '🚃', n: 'Railway Car', c: 'Travel' }, { e: '🚄', n: 'High-Speed Train', c: 'Travel' },
  { e: '🚅', n: 'Bullet Train', c: 'Travel' }, { e: '🚇', n: 'Metro', c: 'Travel' },
  { e: '🚌', n: 'Bus', c: 'Travel' }, { e: '🚎', n: 'Trolleybus', c: 'Travel' },
  { e: '🚐', n: 'Minibus', c: 'Travel' }, { e: '🚗', n: 'Automobile', c: 'Travel' },
  { e: '🚕', n: 'Taxi', c: 'Travel' }, { e: '🚙', n: 'Sport Utility Vehicle', c: 'Travel' },
  { e: '🚒', n: 'Fire Engine', c: 'Travel' }, { e: '🚑', n: 'Ambulance', c: 'Travel' },
  { e: '🚓', n: 'Police Car', c: 'Travel' }, { e: '🚲', n: 'Bicycle', c: 'Travel' },
  { e: '🛴', n: 'Kick Scooter', c: 'Travel' }, { e: '🛵', n: 'Motor Scooter', c: 'Travel' },
  { e: '✈️', n: 'Airplane', c: 'Travel' }, { e: '🛩️', n: 'Small Airplane', c: 'Travel' },
  { e: '🛫', n: 'Airplane Departure', c: 'Travel' }, { e: '🛬', n: 'Airplane Arrival', c: 'Travel' },
  { e: '🚁', n: 'Helicopter', c: 'Travel' }, { e: '🚀', n: 'Rocket', c: 'Travel' },
  { e: '🛸', n: 'Flying Saucer', c: 'Travel' }, { e: '🚢', n: 'Ship', c: 'Travel' },
  { e: '⌚', n: 'Watch', c: 'Travel' }, { e: '📱', n: 'Mobile Phone', c: 'Travel' },
  { e: '💻', n: 'Laptop', c: 'Travel' }, { e: '⌨️', n: 'Keyboard', c: 'Travel' },
  { e: '🖥️', n: 'Desktop Computer', c: 'Travel' }, { e: '🖨️', n: 'Printer', c: 'Travel' },
  // Activities
  { e: '⚽', n: 'Soccer Ball', c: 'Activities' }, { e: '🏀', n: 'Basketball', c: 'Activities' },
  { e: '🏈', n: 'American Football', c: 'Activities' }, { e: '⚾', n: 'Baseball', c: 'Activities' },
  { e: '🎾', n: 'Tennis', c: 'Activities' }, { e: '🏐', n: 'Volleyball', c: 'Activities' },
  { e: '🏓', n: 'Ping Pong', c: 'Activities' }, { e: '🏸', n: 'Badminton', c: 'Activities' },
  { e: '🥊', n: 'Boxing Glove', c: 'Activities' }, { e: '🥋', n: 'Martial Arts Uniform', c: 'Activities' },
  { e: '🎯', n: 'Bullseye', c: 'Activities' }, { e: '⛳', n: 'Flag in Hole', c: 'Activities' },
  { e: '🎿', n: 'Skis', c: 'Activities' }, { e: '🛷', n: 'Sled', c: 'Activities' },
  { e: '🥌', n: 'Curling Stone', c: 'Activities' }, { e: '🎣', n: 'Fishing Pole', c: 'Activities' },
  { e: '🎮', n: 'Video Game', c: 'Activities' }, { e: '🎲', n: 'Game Die', c: 'Activities' },
  { e: '♟️', n: 'Chess Pawn', c: 'Activities' }, { e: '🎭', n: 'Performing Arts', c: 'Activities' },
  { e: '🎨', n: 'Artist Palette', c: 'Activities' }, { e: '🎬', n: 'Clapper Board', c: 'Activities' },
  { e: '🎤', n: 'Microphone', c: 'Activities' }, { e: '🎧', n: 'Headphone', c: 'Activities' },
  { e: '🎵', n: 'Musical Note', c: 'Activities' }, { e: '🎶', n: 'Musical Notes', c: 'Activities' },
  { e: '🎼', n: 'Musical Score', c: 'Activities' }, { e: '🎹', n: 'Musical Keyboard', c: 'Activities' },
  { e: '🥁', n: 'Drum', c: 'Activities' }, { e: '🎷', n: 'Saxophone', c: 'Activities' },
  { e: '🎺', n: 'Trumpet', c: 'Activities' }, { e: '🎸', n: 'Guitar', c: 'Activities' },
  { e: '🎻', n: 'Violin', c: 'Activities' }, { e: '📚', n: 'Books', c: 'Activities' },
  { e: '📖', n: 'Open Book', c: 'Activities' }, { e: '📝', n: 'Memo', c: 'Activities' },
  { e: '✏️', n: 'Pencil', c: 'Activities' }, { e: '🖊️', n: 'Pen', c: 'Activities' },
  { e: '📷', n: 'Camera', c: 'Activities' }, { e: '🎥', n: 'Movie Camera', c: 'Activities' },
  { e: '📺', n: 'Television', c: 'Activities' }, { e: '📻', n: 'Radio', c: 'Activities' },
  { e: '🔦', n: 'Flashlight', c: 'Activities' }, { e: '🔋', n: 'Battery', c: 'Activities' },
  // Objects
  { e: '❤️', n: 'Red Heart', c: 'Objects' }, { e: '🧡', n: 'Orange Heart', c: 'Objects' },
  { e: '💛', n: 'Yellow Heart', c: 'Objects' }, { e: '💚', n: 'Green Heart', c: 'Objects' },
  { e: '💙', n: 'Blue Heart', c: 'Objects' }, { e: '💜', n: 'Purple Heart', c: 'Objects' },
  { e: '🖤', n: 'Black Heart', c: 'Objects' }, { e: '🤍', n: 'White Heart', c: 'Objects' },
  { e: '💔', n: 'Broken Heart', c: 'Objects' }, { e: '❣️', n: 'Heart Exclamation', c: 'Objects' },
  { e: '💕', n: 'Two Hearts', c: 'Objects' }, { e: '💞', n: 'Revolving Hearts', c: 'Objects' },
  { e: '💓', n: 'Beating Heart', c: 'Objects' }, { e: '💗', n: 'Growing Heart', c: 'Objects' },
  { e: '💖', n: 'Sparkling Heart', c: 'Objects' }, { e: '💘', n: 'Heart with Arrow', c: 'Objects' },
  { e: '💝', n: 'Heart with Ribbon', c: 'Objects' }, { e: '💟', n: 'Heart Decoration', c: 'Objects' },
  { e: '✨', n: 'Sparkles', c: 'Objects' }, { e: '🌟', n: 'Glowing Star', c: 'Objects' },
  { e: '⭐', n: 'Star', c: 'Objects' }, { e: '🔥', n: 'Fire', c: 'Objects' },
  { e: '💧', n: 'Droplet', c: 'Objects' }, { e: '💨', n: 'Dashing Away', c: 'Objects' },
  { e: '🕳️', n: 'Hole', c: 'Objects' }, { e: '💬', n: 'Speech Balloon', c: 'Objects' },
  { e: '🗯️', n: 'Right Anger Bubble', c: 'Objects' }, { e: '💢', n: 'Anger Symbol', c: 'Objects' },
  { e: '💤', n: 'Zzz', c: 'Objects' }, { e: '💦', n: 'Sweat Droplets', c: 'Objects' },
  { e: '🩸', n: 'Drop of Blood', c: 'Objects' }, { e: '🪪', n: 'Identification Card', c: 'Objects' },
  { e: '🔐', n: 'Lock with Key', c: 'Objects' }, { e: '🔒', n: 'Locked', c: 'Objects' },
  { e: '🔓', n: 'Unlocked', c: 'Objects' }, { e: '🔑', n: 'Key', c: 'Objects' },
  { e: '🔪', n: 'Kitchen Knife', c: 'Objects' }, { e: '🛡️', n: 'Shield', c: 'Objects' },
  { e: '💣', n: 'Bomb', c: 'Objects' }, { e: '🔫', n: 'Water Pistol', c: 'Objects' },
  { e: '🧨', n: 'Firecracker', c: 'Objects' }, { e: '💉', n: 'Syringe', c: 'Objects' },
  { e: '💊', n: 'Pill', c: 'Objects' }, { e: '🪞', n: 'Mirror', c: 'Objects' },
  // Symbols
  { e: '✅', n: 'Check Mark Button', c: 'Symbols' }, { e: '❌', n: 'Cross Mark', c: 'Symbols' },
  { e: '❓', n: 'Question Mark', c: 'Symbols' }, { e: '❗', n: 'Exclamation Mark', c: 'Symbols' },
  { e: '‼️', n: 'Double Exclamation', c: 'Symbols' }, { e: '⁉️', n: 'Exclamation Question', c: 'Symbols' },
  { e: '➕', n: 'Plus', c: 'Symbols' }, { e: '➖', n: 'Minus', c: 'Symbols' },
  { e: '➗', n: 'Divide', c: 'Symbols' }, { e: '♾️', n: 'Infinity', c: 'Symbols' },
  { e: '💯', n: 'Hundred Points', c: 'Symbols' }, { e: '♻️', n: 'Recycling Symbol', c: 'Symbols' },
  { e: '⚜️', n: 'Fleur-de-lis', c: 'Symbols' }, { e: '🔱', n: 'Trident Emblem', c: 'Symbols' },
  { e: '📛', n: 'Name Badge', c: 'Symbols' }, { e: '🔰', n: 'Japanese Symbol for Beginner', c: 'Symbols' },
  { e: '⭕', n: 'Hollow Red Circle', c: 'Symbols' }, { e: '🛑', n: 'Stop Sign', c: 'Symbols' },
  { e: '💲', n: 'Heavy Dollar Sign', c: 'Symbols' }, { e: '©️', n: 'Copyright', c: 'Symbols' },
  { e: '®️', n: 'Registered', c: 'Symbols' }, { e: '™️', n: 'Trade Mark', c: 'Symbols' },
  { e: '🔞', n: 'No One Under Eighteen', c: 'Symbols' }, { e: '☮️', n: 'Peace Symbol', c: 'Symbols' },
  { e: '☯️', n: 'Yin Yang', c: 'Symbols' }, { e: '🕉️', n: 'Om', c: 'Symbols' },
  { e: '✝️', n: 'Latin Cross', c: 'Symbols' }, { e: '☪️', n: 'Star and Crescent', c: 'Symbols' },
  { e: '☸️', n: 'Wheel of Dharma', c: 'Symbols' }, { e: '✡️', n: 'Star of David', c: 'Symbols' },
  { e: '🔯', n: 'Dotted Six-Pointed Star', c: 'Symbols' }, { e: '🪯', n: 'Khanda', c: 'Symbols' },
  { e: '♈', n: 'Aries', c: 'Symbols' }, { e: '♉', n: 'Taurus', c: 'Symbols' },
  { e: '♊', n: 'Gemini', c: 'Symbols' }, { e: '♋', n: 'Cancer', c: 'Symbols' },
  { e: '♌', n: 'Leo', c: 'Symbols' }, { e: '♍', n: 'Virgo', c: 'Symbols' },
  { e: '♎', n: 'Libra', c: 'Symbols' }, { e: '♏', n: 'Scorpio', c: 'Symbols' },
  { e: '♐', n: 'Sagittarius', c: 'Symbols' }, { e: '♑', n: 'Capricorn', c: 'Symbols' },
  { e: '♒', n: 'Aquarius', c: 'Symbols' }, { e: '♓', n: 'Pisces', c: 'Symbols' },
  { e: '🆔', n: 'ID Button', c: 'Symbols' }, { e: '🆕', n: 'New Button', c: 'Symbols' },
  { e: '🆖', n: 'NG Button', c: 'Symbols' }, { e: '🆗', n: 'OK Button', c: 'Symbols' },
  { e: '🆘', n: 'SOS Button', c: 'Symbols' }, { e: '🆙', n: 'UP! Button', c: 'Symbols' },
  { e: '🆚', n: 'VS Button', c: 'Symbols' }, { e: '🔴', n: 'Red Circle', c: 'Symbols' },
  { e: '🟠', n: 'Orange Circle', c: 'Symbols' }, { e: '🟡', n: 'Yellow Circle', c: 'Symbols' },
  { e: '🟢', n: 'Green Circle', c: 'Symbols' }, { e: '🔵', n: 'Blue Circle', c: 'Symbols' },
  { e: '🟣', n: 'Purple Circle', c: 'Symbols' }, { e: '🟤', n: 'Brown Circle', c: 'Symbols' },
  { e: '⚫', n: 'Black Circle', c: 'Symbols' }, { e: '⚪', n: 'White Circle', c: 'Symbols' },
  // Flags
  { e: '🏳️', n: 'White Flag', c: 'Flags' }, { e: '🏴', n: 'Black Flag', c: 'Flags' },
  { e: '🏁', n: 'Chequered Flag', c: 'Flags' }, { e: '🚩', n: 'Triangular Flag', c: 'Flags' },
  { e: '🏳️‍🌈', n: 'Rainbow Flag', c: 'Flags' }, { e: '🇺🇳', n: 'United Nations', c: 'Flags' },
  { e: '🇺🇸', n: 'United States', c: 'Flags' }, { e: '🇬🇧', n: 'United Kingdom', c: 'Flags' },
  { e: '🇨🇦', n: 'Canada', c: 'Flags' }, { e: '🇦🇺', n: 'Australia', c: 'Flags' },
  { e: '🇮🇳', n: 'India', c: 'Flags' }, { e: '🇯🇵', n: 'Japan', c: 'Flags' },
  { e: '🇨🇳', n: 'China', c: 'Flags' }, { e: '🇰🇷', n: 'South Korea', c: 'Flags' },
  { e: '🇫🇷', n: 'France', c: 'Flags' }, { e: '🇩🇪', n: 'Germany', c: 'Flags' },
  { e: '🇮🇹', n: 'Italy', c: 'Flags' }, { e: '🇪🇸', n: 'Spain', c: 'Flags' },
  { e: '🇧🇷', n: 'Brazil', c: 'Flags' }, { e: '🇲🇽', n: 'Mexico', c: 'Flags' },
  { e: '🇷🇺', n: 'Russia', c: 'Flags' }, { e: '🇿🇦', n: 'South Africa', c: 'Flags' },
  { e: '🇳🇬', n: 'Nigeria', c: 'Flags' }, { e: '🇦🇪', n: 'United Arab Emirates', c: 'Flags' },
  { e: '🇸🇦', n: 'Saudi Arabia', c: 'Flags' }, { e: '🇸🇬', n: 'Singapore', c: 'Flags' },
  { e: '🇳🇿', n: 'New Zealand', c: 'Flags' }, { e: '🇮🇪', n: 'Ireland', c: 'Flags' },
  { e: '🇳🇱', n: 'Netherlands', c: 'Flags' }, { e: '🇨🇭', n: 'Switzerland', c: 'Flags' },
  { e: '🇸🇪', n: 'Sweden', c: 'Flags' }, { e: '🇳🇴', n: 'Norway', c: 'Flags' },
  { e: '🇩🇰', n: 'Denmark', c: 'Flags' }, { e: '🇫🇮', n: 'Finland', c: 'Flags' },
  { e: '🇵🇱', n: 'Poland', c: 'Flags' }, { e: '🇺🇦', n: 'Ukraine', c: 'Flags' },
  { e: '🇹🇷', n: 'Turkey', c: 'Flags' }, { e: '🇮🇱', n: 'Israel', c: 'Flags' },
  { e: '🇪🇬', n: 'Egypt', c: 'Flags' }, { e: '🇦🇷', n: 'Argentina', c: 'Flags' },
  { e: '🇭🇰', n: 'Hong Kong', c: 'Flags' }, { e: '🇹🇼', n: 'Taiwan', c: 'Flags' },
  { e: '🇵🇭', n: 'Philippines', c: 'Flags' }, { e: '🇻🇳', n: 'Vietnam', c: 'Flags' },
  { e: '🇹🇭', n: 'Thailand', c: 'Flags' }, { e: '🇮🇩', n: 'Indonesia', c: 'Flags' },
  { e: '🇲🇾', n: 'Malaysia', c: 'Flags' }, { e: '🇵🇰', n: 'Pakistan', c: 'Flags' },
  { e: '🇧🇩', n: 'Bangladesh', c: 'Flags' }, { e: '🇰🇪', n: 'Kenya', c: 'Flags' },
  { e: '🇵🇹', n: 'Portugal', c: 'Flags' }, { e: '🇬🇷', n: 'Greece', c: 'Flags' },
  { e: '🇨🇿', n: 'Czechia', c: 'Flags' }, { e: '🇭🇺', n: 'Hungary', c: 'Flags' },
  { e: '🇦🇹', n: 'Austria', c: 'Flags' }, { e: '🇧🇪', n: 'Belgium', c: 'Flags' },
  { e: '🇨🇴', n: 'Colombia', c: 'Flags' }, { e: '🇨🇱', n: 'Chile', c: 'Flags' },
  { e: '🇵🇪', n: 'Peru', c: 'Flags' }, { e: '🇮🇸', n: 'Iceland', c: 'Flags' },
  { e: '🇭🇷', n: 'Croatia', c: 'Flags' }, { e: '🇷🇴', n: 'Romania', c: 'Flags' },
  { e: '🇧🇬', n: 'Bulgaria', c: 'Flags' }, { e: '🇷🇸', n: 'Serbia', c: 'Flags' },
];

const CATEGORIES = ['Smileys', 'People', 'Animals', 'Food', 'Travel', 'Activities', 'Objects', 'Symbols', 'Flags'];

function makeAsciiArt(text: string, style: string): string {
  if (!text) return '';
  const chars = text.toUpperCase().split('');
  
  if (style === 'simple') return chars.join('  ');
  
  if (style === 'bubble') {
    return Array.from(text).map(c => {
      const code = c.charCodeAt(0);
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(9398 + (code - 65));
      if (c >= 'a' && c <= 'z') return String.fromCharCode(9424 + (code - 97));
      if (c >= '0' && c <= '9') return String.fromCharCode(9332 + (code - 48));
      return c;
    }).join(' ');
  }

  if (style === 'fancy') {
    return Array.from(text).map(c => {
      const code = c.charCodeAt(0);
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(120276 + (code - 65));
      if (c >= 'a' && c <= 'z') return String.fromCharCode(120302 + (code - 97));
      if (c >= '0' && c <= '9') return String.fromCharCode(120822 + (code - 48));
      return c;
    }).join('');
  }

  if (style === 'block') {
    const FONT: Record<string, string[]> = {
      'A': [' ██ ', '█  █', '████', '█  █', '█  █'],
      'B': ['███ ', '█  █', '███ ', '█  █', '███ '],
      'C': [' ██ ', '█  █', '█   ', '█  █', ' ██ '],
      'D': ['███ ', '█  █', '█  █', '█  █', '███ '],
      'E': ['████', '█   ', '███ ', '█   ', '████'],
      'F': ['████', '█   ', '███ ', '█   ', '█   '],
      'G': [' ███', '█   ', '█ ██', '█  █', ' ██ '],
      'H': ['█  █', '█  █', '████', '█  █', '█  █'],
      'I': ['███', ' █ ', ' █ ', ' █ ', '███'],
      'J': ['  ██', '   █', '   █', '█  █', ' ██ '],
      'K': ['█  █', '█ █ ', '██  ', '█ █ ', '█  █'],
      'L': ['█   ', '█   ', '█   ', '█   ', '████'],
      'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
      'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
      'O': [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
      'P': ['███ ', '█  █', '███ ', '█   ', '█   '],
      'Q': [' ██ ', '█  █', '█  █', '█ ██', ' ███'],
      'R': ['███ ', '█  █', '███ ', '█ █ ', '█  █'],
      'S': [' ███', '█   ', ' ██ ', '   █', '███ '],
      'T': ['███', ' █ ', ' █ ', ' █ ', ' █ '],
      'U': ['█  █', '█  █', '█  █', '█  █', ' ██ '],
      'V': ['█  █', '█  █', '█  █', ' ██ ', ' █  '],
      'W': ['█   █', '█   █', '█ █ █', '█ █ █', ' █ █ '],
      'X': ['█  █', ' ██ ', ' █ ', ' ██ ', '█  █'],
      'Y': ['█  █', ' ██ ', ' █ ', ' █ ', ' █ '],
      'Z': ['████', '   █', '  █ ', ' █  ', '████'],
      ' ': [' ', ' ', ' ', ' ', ' '],
    };
    const lines = ['', '', '', '', ''];
    for (const ch of chars) {
      const glyph = FONT[ch] || FONT[' ']!;
      for (let r = 0; r < 5; r++) lines[r] += glyph[r] + ' ';
    }
    return lines.join('\n');
  }

  if (style === 'digital') {
    const DIGITS: Record<string, string[]> = {
      '0': [' _ ', '| |', '|_|'],
      '1': ['   ', '  |', '  |'],
      '2': [' _ ', ' _|', '|_ '],
      '3': [' _ ', ' _|', ' _|'],
      '4': ['   ', '|_|', '  |'],
      '5': [' _ ', '|_ ', ' _|'],
      '6': [' _ ', '|_ ', '|_|'],
      '7': [' _ ', '  |', '  |'],
      '8': [' _ ', '|_|', '|_|'],
      '9': [' _ ', '|_|', ' _|'],
      'A': [' _ ', '|_|', '| |'],
      'B': ['   ', '|_ ', '|_|'],
      'C': [' _ ', '|  ', '|_ '],
      'D': ['   ', ' _|', '|_ '],
      'E': [' _ ', '|_ ', '|_ '],
      'F': [' _ ', '|_ ', '|  '],
      ' ': ['   ', '   ', '   '],
    };
    const lines = ['', '', ''];
    for (const ch of chars) {
      const glyph = DIGITS[ch] || DIGITS[' ']!;
      for (let r = 0; r < 3; r++) lines[r] += glyph[r] + ' ';
    }
    return lines.join('\n');
  }

  return text;
}

export function EmojiPicker() {
  const [search, setSearch] = useState('');
  const [lastCopied, setLastCopied] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJIS;
    const q = search.toLowerCase();
    return EMOJIS.filter(e => e.n.toLowerCase().includes(q) || e.e.includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof EMOJIS> = {};
    for (const e of filtered) {
      if (!groups[e.c]) groups[e.c] = [];
      groups[e.c]!.push(e);
    }
    return groups;
  }, [filtered]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const copyEmoji = (emoji: string, name: string) => {
    clipboardWrite(emoji);
    setLastCopied(emoji);
    toast.success(`${emoji} ${name} copied!`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
        <SmilePlus className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Emoji Picker
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Browse 400+ emoji organized by category. Click any emoji to copy it.
      </p>
      <div className="space-y-4">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <input aria-label="Search emoji" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emoji..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          {lastCopied && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">{lastCopied}</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Copied! Click another to replace.</span>
            </div>
          )}
          <div className="text-[11px] text-[var(--text-muted)]">{filtered.length} emoji found</div>
        </div>
        <div className="space-y-2">
          {CATEGORIES.map(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            const isOpen = expandedCategories.has(cat);
            return (
              <div key={cat} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <button onClick={() => toggleCategory(cat)} className="w-full flex justify-between items-center px-5 py-3 text-xs font-bold text-[var(--text-secondary)] uppercase hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <span>{cat} ({items.length})</span>
                  <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
                    {items.map((e, i) => (
                      <button key={i} onClick={() => copyEmoji(e.e, e.n)} title={e.n} className="text-xl p-1.5 rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-center cursor-pointer">
                        {e.e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ASCIIArtGenerator() {
  const [asciiInput, setAsciiInput] = useState('HELLO');
  const [asciiStyle, setAsciiStyle] = useState('block');

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const asciiResult = useMemo(() => makeAsciiArt(asciiInput, asciiStyle), [asciiInput, asciiStyle]);

  const presets = [
    { label: 'HELLO (Block)', apply: () => { setAsciiInput('HELLO'); setAsciiStyle('block'); } },
    { label: 'WORLD (Bubble)', apply: () => { setAsciiInput('WORLD'); setAsciiStyle('bubble'); } },
    { label: 'ASCII (Fancy)', apply: () => { setAsciiInput('ASCII'); setAsciiStyle('fancy'); } },
    { label: '1234 (Digital)', apply: () => { setAsciiInput('1234'); setAsciiStyle('digital'); } },
    { label: 'Clear', apply: () => { setAsciiInput(''); } },
  ];

  const resultText = asciiResult ? `Generated ${asciiStyle} style ASCII art` : 'Enter text and select style';

  return (
    <CalculatorShell category="Utility"
      title="ASCII Art Generator"
      result={resultText}
      auto={true}
      calculateLabel="Generate"
      presets={presets}
      accent="blue"
      downloadData={asciiResult}
      downloadFilename="ascii-art.txt"
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Input Text</label>
        <input aria-label="Input Text" value={asciiInput} onChange={e => setAsciiInput(e.target.value)} placeholder="Enter text..." className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1 flex-wrap">
          {['simple', 'block', 'bubble', 'fancy', 'digital'].map(s => (
            <button key={s} onClick={() => setAsciiStyle(s)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${asciiStyle === s ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {asciiResult && (
          <div className="relative bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Result</span>
              <button onClick={() => copy(asciiResult, 'ASCII art')} className="text-[10px] text-[var(--accent)] hover:underline">Copy</button>
            </div>
            <pre className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-5 text-sm text-[var(--text-primary)] font-mono whitespace-pre overflow-x-auto leading-tight">
              {asciiResult}
            </pre>
          </div>
        )}
        {!asciiResult && (
          <p className="text-[var(--text-muted)] text-sm text-center">Enter text and select style to generate ASCII art</p>
        )}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-5">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Character Map Reference</h3>
          <div className="text-xs font-mono text-[var(--text-secondary)] leading-loose">
            <span className="text-[var(--text-primary)]">@</span> 80-100%{' '}
            <span className="text-[var(--text-primary)]">%</span> 60-80%{' '}
            <span className="text-[var(--text-primary)]">#</span> 40-60%{' '}
            <span className="text-[var(--text-primary)]">*</span> 20-40%{' '}
            <span className="text-[var(--text-primary)]">+</span> 10-20%{' '}
            <span className="text-[var(--text-primary)]">=</span> 5-10%{' '}
            <span className="text-[var(--text-primary)]">-</span> 2-5%{' '}
            <span className="text-[var(--text-primary)]">.</span> 0-2%
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

const FONT_PATTERNS: Record<string, Record<string, string[]>> = {
  'standard': {
    'A': ['  ██  ', '██  ██', '██████', '██  ██', '██  ██'],
    'B': ['█████ ', '██  ██', '█████ ', '██  ██', '█████ '],
    'C': [' ████', '██    ', '██    ', '██    ', ' ████'],
    'D': ['████  ', '██  ██', '██  ██', '██  ██', '████  '],
    'E': ['██████', '██    ', '████  ', '██    ', '██████'],
    'F': ['██████', '██    ', '████  ', '██    ', '██    '],
    'G': [' ████', '██    ', '██ ███', '██  ██', ' ████'],
    'H': ['██  ██', '██  ██', '██████', '██  ██', '██  ██'],
    'I': ['██████', '  ██  ', '  ██  ', '  ██  ', '██████'],
    'J': ['██████', '    ██', '    ██', '██  ██', ' ████ '],
    'K': ['██  ██', '██ ██ ', '████  ', '██ ██ ', '██  ██'],
    'L': ['██    ', '██    ', '██    ', '██    ', '██████'],
    'M': ['██   ██', '███ ███', '██ █ ██', '██   ██', '██   ██'],
    'N': ['██  ██', '███ ██', '██████', '██ ███', '██  ██'],
    'O': [' ████ ', '██  ██', '██  ██', '██  ██', ' ████ '],
    'P': ['█████ ', '██  ██', '█████ ', '██    ', '██    '],
    'Q': [' ████ ', '██  ██', '██  ██', '██ ██ ', ' ██ ██'],
    'R': ['█████ ', '██  ██', '█████ ', '██ ██ ', '██  ██'],
    'S': [' █████', '██    ', ' ████ ', '    ██', '█████ '],
    'T': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
    'U': ['██  ██', '██  ██', '██  ██', '██  ██', ' ████ '],
    'V': ['██  ██', '██  ██', '██  ██', ' ████ ', '  ██  '],
    'W': ['██   ██', '██   ██', '██ █ ██', '███ ███', '██   ██'],
    'X': ['██  ██', ' ████ ', '  ██  ', ' ████ ', '██  ██'],
    'Y': ['██  ██', ' ████ ', '  ██  ', '  ██  ', '  ██  '],
    'Z': ['██████', '   ██ ', '  ██  ', ' ██   ', '██████'],
    '0': [' ████ ', '██  ██', '██  ██', '██  ██', ' ████ '],
    '1': ['  ██  ', ' ███  ', '  ██  ', '  ██  ', '██████'],
    '2': [' ████ ', '██  ██', '   ██ ', '  ██  ', '██████'],
    '3': [' ████ ', '    ██', '  ███ ', '    ██', ' ████ '],
    '4': ['██  ██', '██  ██', '██████', '    ██', '    ██'],
    '5': ['██████', '██    ', '█████ ', '    ██', '█████ '],
    '6': [' ████ ', '██    ', '█████ ', '██  ██', ' ████ '],
    '7': ['██████', '    ██', '   ██ ', '  ██  ', '  ██  '],
    '8': [' ████ ', '██  ██', ' ████ ', '██  ██', ' ████ '],
    '9': [' ████ ', '██  ██', ' █████', '    ██', ' ████ '],
    ' ': ['      ', '      ', '      ', '      ', '      '],
    '!': ['  ██  ', '  ██  ', '  ██  ', '      ', '  ██  '],
    '?': [' ████ ', '    ██', '  ██  ', '      ', '  ██  '],
    '.': ['      ', '      ', '      ', '      ', '  ██  '],
    ',': ['      ', '      ', '      ', '  ██  ', ' ██   '],
    '-': ['      ', '      ', '██████', '      ', '      '],
    ':': ['      ', '  ██  ', '      ', '  ██  ', '      '],
    "'": ['  ██  ', '  ██  ', '      ', '      ', '      '],
    '"': ['██  ██', '██  ██', '      ', '      ', '      '],
    '(': ['  ██  ', ' ██   ', ' ██   ', ' ██   ', '  ██  '],
    ')': ['  ██  ', '   ██ ', '   ██ ', '   ██ ', '  ██  '],
    '/': ['    ██', '   ██ ', '  ██  ', ' ██   ', '██    '],
    '@': [' ████ ', '██  ███', '██ █ ██', '██ ███ ', ' ████ '],
    '#': [' █ ██ ', '██████', ' █ ██ ', '██████', ' █ ██ '],
    '$': ['  ██  ', ' ████ ', '██    ', ' ████ ', '  ██  '],
    '%': ['██   ██', '   ██ ', '  ██  ', ' ██   ', '██   ██'],
    '&': [' ████ ', '██  ██', ' ███  ', '██  ██', ' ███ ██'],
    '*': ['      ', '██ ███', ' ███  ', '██ ███', '      '],
    '+': ['      ', '  ██  ', '██████', '  ██  ', '      '],
    '=': ['      ', '██████', '      ', '██████', '      '],
    '<': ['   ██ ', '  ██  ', ' ██   ', '  ██  ', '   ██ '],
    '>': [' ██   ', '  ██  ', '   ██ ', '  ██  ', ' ██   '],
    '[': [' ████ ', ' ██   ', ' ██   ', ' ██   ', ' ████ '],
    ']': [' ████ ', '   ██ ', '   ██ ', '   ██ ', ' ████ '],
    '{': ['  ███ ', '  ██  ', '██    ', '  ██  ', '  ███ '],
    '}': [' ███  ', '  ██  ', '    ██', '  ██  ', ' ███  '],
    '|': ['  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
    '_': ['      ', '      ', '      ', '      ', '██████'],
    '~': ['      ', '██ ███', '█████ ', '      ', '      '],
    '^': ['  ██  ', ' ████ ', '██  ██', '      ', '      '],
  },
};

function renderAsciiFont(text: string, font: string): string {
  const pattern = FONT_PATTERNS[font] || FONT_PATTERNS['standard']!;
  const upper = text.toUpperCase();
  const lines: string[] = ['', '', '', '', ''];
  
  for (const char of upper) {
    const glyph = pattern[char] || pattern[' ']!;
    for (let i = 0; i < 5; i++) {
      lines[i] += glyph[i] + ' ';
    }
  }
  
  return lines.join('\n');
}

export function ASCIIFontGenerator() {
  const [fontInput, setFontInput] = useState('HELLO');
  const [fontStyle, setFontStyle] = useState('standard');

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const fontResult = useMemo(() => renderAsciiFont(fontInput, fontStyle), [fontInput, fontStyle]);

  const presets = [
    { label: 'HELLO', apply: () => { setFontInput('HELLO'); } },
    { label: 'WORLD', apply: () => { setFontInput('WORLD'); } },
    { label: 'ASCII', apply: () => { setFontInput('ASCII'); } },
    { label: 'CLEAR', apply: () => { setFontInput(''); } },
  ];

  const resultText = fontResult ? `Generated ${fontStyle} font banner` : 'Enter text to generate';

  return (
    <CalculatorShell category="Utility"
      title="ASCII Font Generator"
      result={resultText}
      auto={true}
      calculateLabel="Generate"
      presets={presets}
      accent="purple"
      downloadData={fontResult}
      downloadFilename="ascii-font.txt"
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Input Text</label>
        <input aria-label="Input Text" value={fontInput} onChange={e => setFontInput(e.target.value)} placeholder="Enter text..." className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1 flex-wrap">
          {['standard'].map(s => (
            <button key={s} onClick={() => setFontStyle(s)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${fontStyle === s ? 'bg-[var(--bg-elevated)] text-purple-600 dark:text-purple-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {fontResult && (
          <div className="relative bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Result</span>
              <button onClick={() => copy(fontResult, 'ASCII font')} className="text-[10px] text-[var(--accent)] hover:underline">Copy</button>
            </div>
            <pre className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-5 text-sm text-[var(--text-primary)] font-mono whitespace-pre overflow-x-auto leading-tight">
              {fontResult}
            </pre>
          </div>
        )}
        {!fontResult && (
          <p className="text-[var(--text-muted)] text-sm text-center">Enter text to generate ASCII font banner</p>
        )}
      </div>
    </CalculatorShell>
  );
}

function Type(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}
