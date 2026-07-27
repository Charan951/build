# Build Your Thoughts

# UI/UX Guidelines

Version 1.0

Document

04_UI_UX_Guidelines.md

---

# PART 4

# Motion Design, 3D System & Premium Interactions

---

# 1. Motion Philosophy

Motion should never exist for decoration alone.

Every animation must improve one or more of the following:

• Usability

• Navigation

• Storytelling

• Feedback

• Delight

• Brand Perception

The experience should feel calm, premium, and effortless.

Users should notice the quality of the interaction—not the animation itself.

---

# Motion Personality

The website should feel

Elegant

Organic

Smooth

Responsive

Confident

Modern

Premium

Minimal

Avoid flashy, distracting, or repetitive effects.

---

# Motion Stack

Primary

Framer Motion

Smooth Scroll

Lenis

3D

React Three Fiber

Advanced Scroll

GSAP (only when Framer Motion is insufficient)

Intersection

React Intersection Observer

---

# Animation Timing Scale

Extra Fast

100ms

Micro

150ms

Fast

250ms

Normal

400ms

Medium

600ms

Slow

800ms

Hero

1200ms

Page Transition

700ms

---

# Easing

Default

easeInOut

Entrance

easeOut

Exit

easeIn

Spring

Damping

24

Stiffness

180

Mass

0.8

---

# Global Animation Rules

Never animate everything simultaneously.

Maximum visible animations per viewport:

5

Stagger groups.

Respect user focus.

Prefer opacity + transform.

Avoid layout thrashing.

Target 60 FPS.

---

# Page Load Sequence

When the website opens:

1

Logo appears

↓

2

Background fades

↓

3

Navigation slides down

↓

4

Hero headline reveals

↓

5

Description fades

↓

6

Buttons appear

↓

7

3D object animates

↓

8

Scroll indicator starts

Entire duration:

1.5 seconds

---

# Page Transitions

Every route should transition smoothly.

Exit Page

↓

Fade Out

↓

Mask Animation

↓

New Page

↓

Fade In

↓

Reveal Content

Duration

700ms

---

# Navigation Animation

Initial

Slide Down

20px

Opacity 0 → 1

---

Scroll Down

Hide Navigation

Translate Y

-100%

---

Scroll Up

Reveal

Translate Y

0

---

Mobile Menu

Overlay Fade

Drawer Slide

Menu Item Stagger

40ms

---

# Hero Animation

Headline

Split Text Reveal

Word by Word

Duration

1000ms

---

Description

Fade Up

Delay

300ms

---

Buttons

Scale

Opacity

Delay

500ms

---

Statistics

Counter Animation

Delay

700ms

---

3D Scene

Float

Rotate Slowly

Mouse Follow

---

Scroll Indicator

Bounce

Every 2 Seconds

---

# Section Reveal

Every section enters only once.

Animation

Opacity

0 → 1

Translate Y

40px → 0

Duration

600ms

Threshold

20%

---

# Card Animations

Initial

Opacity

0

Translate Y

30px

Hover

Lift

12px

Tilt

3°

Shadow Increase

Scale

1.02

Exit

Fade

---

# Service Cards

Hover

Rotate Icon

Scale Card

Lime Border

Cursor Label

"Explore"

---

# Project Cards

Image Zoom

105%

Card Lift

Technology Chips Fade

CTA Slide Up

Cursor

"View Project"

---

# Blog Cards

Image Zoom

Title Translate

Category Fade

Reading Time Slide

---

# Button Animations

Hover

Scale

1.03

Shadow

Increase

Background

Black → Lime

Text

White → Black

Active

Scale

0.97

Ripple

Optional

---

# Icon Animation

Hover

Rotate

5°

Scale

110%

Duration

200ms

---

# Link Animation

Underline grows

Left → Right

Duration

250ms

---

# Image Animation

Reveal

Mask

Parallax

Hover Zoom

Lazy Fade

---

# Statistics Animation

Counter starts when visible.

Ease Out

Duration

2 Seconds

Only animate once.

---

# Logo Animation

Hover

Rotate

5°

Scale

105%

Page Loader

Continuous Morph

---

# Timeline Animation

Progress Line Draw

Cards Appear Sequentially

Scroll Driven

---

# FAQ Animation

Accordion Height Auto

Chevron Rotate

Answer Fade

---

# Forms

Input Focus

Lime Border

Soft Glow

Label Lift

Validation Shake

Error Fade

Success Checkmark

---

# Toast Notifications

Slide In

Top Right

Fade Out

Auto Close

5 Seconds

---

# Modal Animation

Overlay Fade

Dialog Scale

0.95 → 1

Duration

250ms

Exit

Reverse

---

# Drawer Animation

Slide From Right

Fade Overlay

Menu Stagger

---

# Skeleton Animation

Soft Shimmer

1.5 Second Loop

No Flashing

---

# Empty State

Illustration Fade

Text Reveal

CTA Scale

---

# Error State

Icon Bounce

Message Fade

Retry Button Lift

---

# Custom Cursor

Desktop Only

Default

Lime Circle

Hover

Expand

Magnetic

Project Cards

"Open"

Buttons

"Click"

Videos

"Play"

Gallery

"View"

Drag Area

"Drag"

---

# Magnetic Buttons

Mouse approaches

↓

Button follows

↓

Returns smoothly

Maximum Distance

12px

---

# Scroll Progress

Thin Progress Bar

Top of Screen

Lime

Height

3px

---

# Scroll Storytelling

Used on

Hero

Projects

About

Case Studies

Content enters progressively.

Never overload.

---

# Sticky Sections

Technology Stack

Workflow

Project Timeline

Case Studies

Sticky while scrolling.

---

# Horizontal Scroll

Desktop Only

Projects

Client Logos

Awards

Gallery

Natural mouse wheel conversion.

---

# Text Animation

Hero

Split by Word

Section Titles

Split by Line

Paragraph

Fade

No typewriter effect for body content.

---

# Background Motion

Noise Texture

Static

Organic Shapes

Float Slowly

Gradient

Very Subtle

No aggressive glowing effects.

---

# Parallax Rules

Images

10–20%

3D Objects

15%

Background Shapes

5%

Text

Never

---

# Mouse Interaction

3D Hero

Rotate

Cards

Tilt

Images

Slight Pan

Buttons

Magnetic

---

# 3D Philosophy

3D supports the content.

It should never distract.

Use realistic lighting.

Soft reflections.

Minimal geometry.

Premium materials.

---

# Hero 3D Scene

Floating graphite cube

Glass ring

Lime accent light

Subtle particles

Soft shadows

Interactive rotation

Floating animation

---

# About Section 3D

Minimal wireframe sphere

Animated points

Very slow rotation

---

# Services 3D

Floating technology blocks

Each block represents

Development

Cloud

AI

Mobile

UI/UX

Hover interaction

---

# Projects 3D

Device mockups

Laptop

Tablet

Phone

Project preview inside

Scroll synchronized

---

# Technology Stack

Interactive floating icons

Hover expands

Soft rotation

Glass pedestal

---

# Contact Section

Abstract globe

Connection lines

Soft animation

Represents worldwide reach

---

# Lighting

Neutral daylight

Soft HDRI

No saturated lighting

Lime accent only

---

# Materials

Matte Graphite

Frosted Glass

Brushed Metal

Soft Plastic

No chrome

No neon

---

# Shadows

Soft

Diffuse

Natural

No harsh shadows

---

# Performance Targets

Maintain

60 FPS

Maximum

3 active WebGL scenes

Lazy load 3D assets

Compress textures

Use Draco compression

Dispose unused geometries

---

# Reduced Motion

If prefers-reduced-motion is enabled:

Disable parallax

Disable floating

Disable cursor

Disable split text

Use simple fade transitions

---

# Motion Accessibility

No flashing

No rapid scaling

No infinite distracting movement

No autoplay animations requiring user attention

All animations must remain keyboard accessible

---

# Motion Tokens

Fast

150ms

Normal

300ms

Medium

500ms

Slow

700ms

Extra Slow

1000ms

Distance Small

8px

Distance Medium

24px

Distance Large

48px

Border Radius Animation

200ms

Opacity

250ms

Scale

300ms

---

# Framer Motion Variants

Page

Initial

Opacity 0

Y 20

Animate

Opacity 1

Y 0

Exit

Opacity 0

Y -20

---

Cards

Initial

Opacity 0

Y 30

Hover

Scale 1.02

RotateX 2°

RotateY 2°

---

Buttons

Hover

Scale 1.03

Tap

Scale 0.97

---

Images

Initial

Scale 1.08

Animate

Scale 1

---

Navigation

Hidden

Y -100%

Visible

Y 0

---

# Lenis Configuration

Duration

1.2

Smooth Wheel

Enabled

Smooth Touch

Enabled

Infinite Scroll

Disabled

Sync Touch

Enabled

Gesture Direction

Vertical

---

# Acceptance Criteria

The motion system is complete when:

✓ Every interaction has a defined animation.

✓ Motion reinforces usability rather than distracting from it.

✓ Animations remain consistent across all pages.

✓ Page transitions feel smooth and cohesive.

✓ WebGL scenes maintain high performance.

✓ Motion respects reduced-motion user preferences.

✓ All animations achieve a premium, editorial experience.

✓ The overall interaction quality reflects a modern, enterprise-grade digital product comparable to Apple, Linear, and Awwwards-winning websites.

---

# End of Part 4