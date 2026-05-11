# Animation Guide - Framer Motion Implementation

## Overview
Menambahkan animasi in/out yang smooth dan menarik menggunakan Framer Motion untuk meningkatkan user experience.

## Installation

```bash
npm install framer-motion
```

## Animation Components Created

### File: `src/components/shared/animated-section.tsx`

#### 1. AnimatedSection
Komponen untuk animasi section dengan berbagai jenis animasi.

**Props:**
- `children`: ReactNode - Content yang akan dianimasi
- `delay`: number (optional) - Delay sebelum animasi dimulai (default: 0)
- `className`: string (optional) - Custom className
- `animation`: string (optional) - Jenis animasi (default: 'fadeIn')

**Available Animations:**
- `fadeIn` - Fade in dari opacity 0 ke 1
- `slideUp` - Slide dari bawah dengan fade
- `slideDown` - Slide dari atas dengan fade
- `slideLeft` - Slide dari kanan dengan fade
- `slideRight` - Slide dari kiri dengan fade
- `scale` - Scale dari 0.8 ke 1 dengan fade
- `rotate` - Rotate dari -10deg ke 0 dengan fade

**Usage:**
```tsx
<AnimatedSection animation="slideUp" delay={0.2}>
  <h1>Your Content</h1>
</AnimatedSection>
```

#### 2. StaggerContainer & StaggerItem
Komponen untuk animasi stagger (berurutan) pada multiple items.

**Usage:**
```tsx
<StaggerContainer>
  <StaggerItem>Item 1</StaggerItem>
  <StaggerItem>Item 2</StaggerItem>
  <StaggerItem>Item 3</StaggerItem>
</StaggerContainer>
```

**Features:**
- Animasi muncul berurutan dengan delay 0.1s antar item
- Smooth fade + slide up effect
- Viewport detection (animasi trigger saat scroll)

#### 3. FloatingElement
Komponen untuk animasi floating (naik-turun).

**Usage:**
```tsx
<FloatingElement>
  <Icon />
</FloatingElement>
```

**Features:**
- Animasi naik-turun infinite
- Duration 3 detik
- Smooth easing

#### 4. ScaleOnHover
Komponen untuk scale effect saat hover.

**Usage:**
```tsx
<ScaleOnHover>
  <Card>Your Card Content</Card>
</ScaleOnHover>
```

**Features:**
- Scale 1.05 saat hover
- Scale 0.95 saat tap/click
- Smooth transition 0.2s

## Implementation Examples

### Landing Page Hero Section

```tsx
<AnimatedSection animation="slideDown" delay={0.1}>
  <Badge>Platform Terbaik</Badge>
</AnimatedSection>

<AnimatedSection animation="fadeIn" delay={0.2}>
  <h1>Booking Lapangan Padel Jadi Mudah</h1>
</AnimatedSection>

<AnimatedSection animation="slideUp" delay={0.3}>
  <p>Platform all-in-one untuk booking...</p>
</AnimatedSection>

<AnimatedSection animation="scale" delay={0.4}>
  <div className="flex gap-4">
    <Button>Mulai Booking</Button>
    <Button>Lihat Lapangan</Button>
  </div>
</AnimatedSection>

<StaggerContainer className="mt-12 grid grid-cols-3">
  <StaggerItem>
    <div>100+ Booking</div>
  </StaggerItem>
  <StaggerItem>
    <div>50+ Member</div>
  </StaggerItem>
  <StaggerItem>
    <div>4.9 Rating</div>
  </StaggerItem>
</StaggerContainer>
```

### Features Section

```tsx
<AnimatedSection animation="slideUp" className="mb-12 text-center">
  <Badge>Fitur Unggulan</Badge>
  <h2>Kenapa Pilih Padels?</h2>
  <p>Platform terlengkap...</p>
</AnimatedSection>

<StaggerContainer className="grid md:grid-cols-3 gap-6">
  <StaggerItem>
    <ScaleOnHover>
      <Card>
        <FloatingElement>
          <div className="icon-wrapper">
            <Calendar />
          </div>
        </FloatingElement>
        <h3>Booking Real-Time</h3>
        <p>Description...</p>
      </Card>
    </ScaleOnHover>
  </StaggerItem>
  
  {/* Repeat for other features */}
</StaggerContainer>
```

### How It Works Section

```tsx
<AnimatedSection animation="slideUp">
  <Badge>Cara Kerja</Badge>
  <h2>Booking Dalam 3 Langkah Mudah</h2>
</AnimatedSection>

<StaggerContainer className="grid md:grid-cols-3 gap-8">
  <StaggerItem>
    <AnimatedSection animation="scale">
      <div className="circle">1</div>
      <h3>Pilih Lapangan</h3>
      <p>Browse lapangan...</p>
    </AnimatedSection>
  </StaggerItem>
  
  <StaggerItem>
    <AnimatedSection animation="scale" delay={0.1}>
      <div className="circle">2</div>
      <h3>Pilih Waktu</h3>
      <p>Tentukan tanggal...</p>
    </AnimatedSection>
  </StaggerItem>
  
  <StaggerItem>
    <AnimatedSection animation="scale" delay={0.2}>
      <div className="circle">3</div>
      <h3>Bayar & Main</h3>
      <p>Lakukan pembayaran...</p>
    </AnimatedSection>
  </StaggerItem>
</StaggerContainer>
```

### CTA Section

```tsx
<AnimatedSection animation="scale">
  <Card className="gradient-card">
    <h2>Siap Mulai Bermain?</h2>
    <p>Daftar sekarang...</p>
    <div className="flex gap-4">
      <Button>Daftar Gratis</Button>
      <Button>Sudah Punya Akun</Button>
    </div>
  </Card>
</AnimatedSection>
```

## Login & Register Pages

### Login Page

```tsx
'use client'

import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/animated-section'

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      {/* Left Side - Branding */}
      <AnimatedSection animation="slideRight" className="hidden lg:block">
        <div className="branding-content">
          <AnimatedSection animation="fadeIn" delay={0.2}>
            <Logo />
          </AnimatedSection>
          
          <AnimatedSection animation="slideUp" delay={0.3}>
            <h2>Selamat Datang Kembali!</h2>
            <p>Login untuk melanjutkan...</p>
          </AnimatedSection>
          
          <StaggerContainer>
            <StaggerItem>
              <div className="benefit-item">
                <CheckCircle />
                <span>Booking lapangan real-time</span>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="benefit-item">
                <CheckCircle />
                <span>Belanja produk berkualitas</span>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="benefit-item">
                <CheckCircle />
                <span>Pembayaran mudah & aman</span>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </AnimatedSection>
      
      {/* Right Side - Form */}
      <AnimatedSection animation="slideLeft">
        <Card>
          <AnimatedSection animation="scale" delay={0.2}>
            <Logo />
          </AnimatedSection>
          
          <AnimatedSection animation="fadeIn" delay={0.3}>
            <h2>Login</h2>
            <p>Masukkan email dan password</p>
          </AnimatedSection>
          
          <AnimatedSection animation="slideUp" delay={0.4}>
            <form>
              {/* Form fields */}
            </form>
          </AnimatedSection>
        </Card>
      </AnimatedSection>
    </div>
  )
}
```

### Register Page

Similar structure dengan login page, gunakan animasi yang sama.

## Animation Configuration

### Viewport Settings
```tsx
viewport={{ once: true, margin: '-100px' }}
```

**Explanation:**
- `once: true` - Animasi hanya trigger sekali (tidak repeat saat scroll)
- `margin: '-100px'` - Trigger animasi 100px sebelum element masuk viewport

### Transition Settings
```tsx
transition={{
  duration: 0.6,
  delay: 0,
  ease: [0.25, 0.4, 0.25, 1], // Cubic bezier easing
}}
```

**Explanation:**
- `duration: 0.6` - Durasi animasi 0.6 detik
- `delay` - Delay sebelum animasi dimulai
- `ease` - Easing function untuk smooth animation

### Stagger Settings
```tsx
transition={{
  staggerChildren: 0.1, // Delay 0.1s antar child
}}
```

## Best Practices

### 1. Performance
- ✅ Use `once: true` untuk viewport detection
- ✅ Avoid animating too many elements simultaneously
- ✅ Use `will-change` CSS property untuk complex animations
- ✅ Prefer transform & opacity animations (GPU accelerated)

### 2. Timing
- ✅ Hero section: 0.1-0.4s delays
- ✅ Features: Stagger dengan 0.1s delay
- ✅ CTA: 0.2-0.3s delay
- ✅ Keep total animation time under 1s

### 3. Accessibility
- ✅ Respect `prefers-reduced-motion` media query
- ✅ Don't rely solely on animation for important info
- ✅ Ensure content is readable during animation
- ✅ Provide skip animation option if needed

### 4. Mobile
- ✅ Reduce animation complexity on mobile
- ✅ Shorter durations on mobile (0.3-0.4s)
- ✅ Avoid heavy animations on low-end devices
- ✅ Test on actual devices

## Prefers Reduced Motion

Add this to respect user preferences:

```tsx
'use client'

import { useReducedMotion } from 'framer-motion'

export function AnimatedSection({ children, ...props }) {
  const shouldReduceMotion = useReducedMotion()
  
  if (shouldReduceMotion) {
    return <div className={props.className}>{children}</div>
  }
  
  return (
    <motion.div {...props}>
      {children}
    </motion.div>
  )
}
```

## Animation Variants Library

### Fade Animations
```tsx
const fadeVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeOut: {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  },
}
```

### Slide Animations
```tsx
const slideVariants = {
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
}
```

### Scale Animations
```tsx
const scaleVariants = {
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleOut: {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.8 },
  },
}
```

### Rotate Animations
```tsx
const rotateVariants = {
  rotateIn: {
    hidden: { opacity: 0, rotate: -10 },
    visible: { opacity: 1, rotate: 0 },
  },
  rotateOut: {
    visible: { opacity: 1, rotate: 0 },
    hidden: { opacity: 0, rotate: 10 },
  },
}
```

## Advanced Animations

### Path Animation
```tsx
<motion.path
  d="M 0 0 L 100 100"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 2 }}
/>
```

### Text Animation
```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.8,
    ease: "easeOut",
  }}
>
  {text.split("").map((char, i) => (
    <motion.span
      key={i}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.05 }}
    >
      {char}
    </motion.span>
  ))}
</motion.h1>
```

### Parallax Effect
```tsx
<motion.div
  style={{ y: useTransform(scrollY, [0, 1000], [0, -100]) }}
>
  <Image src="/hero.jpg" />
</motion.div>
```

## Testing Checklist

- [ ] Animations trigger correctly on scroll
- [ ] No layout shift during animation
- [ ] Smooth on 60fps
- [ ] Works on mobile devices
- [ ] Respects prefers-reduced-motion
- [ ] No animation jank
- [ ] Proper z-index layering
- [ ] Accessible with keyboard
- [ ] Loading states animated
- [ ] Error states animated

## Files Created/Modified

1. ✅ `src/components/shared/animated-section.tsx` - Animation components
2. ✅ `src/app/page.tsx` - Landing page dengan animasi
3. ✅ `src/app/(auth)/login/page.tsx` - Login page (ready for animations)
4. ✅ `src/app/(auth)/register/page.tsx` - Register page (ready for animations)

## Performance Metrics

### Target Metrics
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Animation Frame Rate: 60fps

### Optimization Tips
1. Use `transform` and `opacity` (GPU accelerated)
2. Avoid animating `width`, `height`, `top`, `left`
3. Use `will-change` sparingly
4. Debounce scroll events
5. Use `IntersectionObserver` for viewport detection
6. Lazy load heavy animations
7. Reduce animation complexity on mobile

## Browser Support

- ✅ Chrome 51+
- ✅ Firefox 54+
- ✅ Safari 10+
- ✅ Edge 79+
- ✅ iOS Safari 10+
- ✅ Chrome Android 51+

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Best Practices](https://web.dev/animations/)
- [Cubic Bezier Generator](https://cubic-bezier.com/)
- [Easing Functions](https://easings.net/)
