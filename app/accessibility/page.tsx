'use client'

import { useAccessibility } from '@/contexts/AccessibilityContext'
import {
  Accessibility,
  CheckCircle,
  Ear,
  Eye,
  Globe,
  Heart,
  Keyboard,
  Link as LinkIcon,
  Monitor,
  MousePointer,
  RotateCcw,
  Zap,
  ZoomIn,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function AccessibilityPage() {
  const { settings, updateSettings, resetSettings } = useAccessibility()

  const accessibilityFeatures = [
    {
      icon: Eye,
      title: 'Visual Adjustments',
      features: [
        'Adjust text size (75% to 200%)',
        'High contrast mode',
        'Grayscale mode for light sensitivity',
        'Underline all links for visibility',
      ],
    },
    {
      icon: Ear,
      title: 'Auditory Support',
      features: [
        'All videos include captions',
        'Audio content has transcripts',
        'Volume controls on all media players',
        'No auto-playing videos',
      ],
    },
    {
      icon: MousePointer,
      title: 'Navigation',
      features: [
        'Full keyboard navigation',
        'Skip to main content links',
        'Large clickable areas (min 44x44px)',
        'Clear focus indicators',
      ],
    },
    {
      icon: Globe,
      title: 'Comprehension',
      features: [
        'Plain language throughout',
        'Consistent layout and navigation',
        'Reduced motion option',
        'Clear error messages and instructions',
      ],
    },
  ]

  const quickActions = [
    {
      action: 'Increase Text Size',
      shortcut: 'Ctrl/Cmd + +',
      description: 'Makes all text larger',
      icon: 'A+',
    },
    {
      action: 'Decrease Text Size',
      shortcut: 'Ctrl/Cmd + -',
      description: 'Makes all text smaller',
      icon: 'A-',
    },
    {
      action: 'Reset Zoom',
      shortcut: 'Ctrl/Cmd + 0',
      description: 'Returns to default text size',
      icon: '⟲',
    },
    {
      action: 'Navigate Links',
      shortcut: 'Tab',
      description: 'Move between interactive elements',
      icon: '↹',
    },
  ]

  const demoText = `This is an example of how text appears at ${settings.fontSize}% size. You can adjust the slider below to see how different text sizes affect readability. The quick brown fox jumps over the lazy dog.`

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
              <Accessibility className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Accessibility Features
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Settings that work across the entire PropSafe Hub platform
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Global Settings</span> • Applies
                site-wide
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Saved Automatically</span> • No
                need to reapply
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-16">
        {/* Live Preview Section */}
        <section className="mb-16 bg-linear-to-r from-emerald-50 to-emerald-50 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Monitor className="h-8 w-8 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Live Preview
                </h2>
              </div>
              <p className="text-gray-600">
                See how your settings affect text appearance in real-time
              </p>
            </div>
            <Button
              onClick={resetSettings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Settings
            </Button>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-xl border p-8 mb-8">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Text Preview</h3>
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="leading-relaxed">{demoText}</p>
              </div>
            </div>

            {/* Text Size Control */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ZoomIn className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Text Size</h3>
                    <p className="text-sm text-gray-500">
                      Adjust for better readability
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {settings.fontSize}%
                </span>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="75"
                  max="200"
                  step="5"
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSettings({ fontSize: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  aria-label="Adjust text size"
                />
                <div className="flex justify-between">
                  {[75, 100, 125, 150, 175, 200].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`text-sm px-2 py-1 rounded ${settings.fontSize === size ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-emerald-600'}`}
                      aria-label={`Set text size to ${size}%`}
                    >
                      {size}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">High Contrast</span>
                  </div>
                  <button
                    onClick={() =>
                      updateSettings({ highContrast: !settings.highContrast })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.highContrast ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    aria-label={
                      settings.highContrast
                        ? 'Disable high contrast'
                        : 'Enable high contrast'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Enhances text-background contrast
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Grayscale</span>
                  </div>
                  <button
                    onClick={() =>
                      updateSettings({ grayscaleMode: !settings.grayscaleMode })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.grayscaleMode ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    aria-label={
                      settings.grayscaleMode
                        ? 'Disable grayscale'
                        : 'Enable grayscale'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.grayscaleMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Reduces color saturation
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Link Underlines</span>
                  </div>
                  <button
                    onClick={() =>
                      updateSettings({ linkUnderline: !settings.linkUnderline })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.linkUnderline ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    aria-label={
                      settings.linkUnderline
                        ? 'Hide link underlines'
                        : 'Show link underlines'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.linkUnderline ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Always underline clickable links
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Reduce Motion</span>
                  </div>
                  <button
                    onClick={() =>
                      updateSettings({ reducedMotion: !settings.reducedMotion })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.reducedMotion ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    aria-label={
                      settings.reducedMotion
                        ? 'Enable animations'
                        : 'Reduce animations'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Minimizes animations and transitions
                </p>
              </div>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Active Settings Applied Site-Wide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-lg font-bold text-emerald-600">
                  {settings.fontSize}%
                </div>
                <div className="text-xs text-emerald-700">Text Size</div>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${settings.highContrast ? 'bg-emerald-50' : 'bg-gray-50'}`}
              >
                <div
                  className={`text-lg font-bold ${settings.highContrast ? 'text-emerald-600' : 'text-gray-400'}`}
                >
                  {settings.highContrast ? 'ON' : 'OFF'}
                </div>
                <div
                  className={`text-xs ${settings.highContrast ? 'text-emerald-700' : 'text-gray-600'}`}
                >
                  High Contrast
                </div>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${settings.grayscaleMode ? 'bg-emerald-50' : 'bg-gray-50'}`}
              >
                <div
                  className={`text-lg font-bold ${settings.grayscaleMode ? 'text-emerald-600' : 'text-gray-400'}`}
                >
                  {settings.grayscaleMode ? 'ON' : 'OFF'}
                </div>
                <div
                  className={`text-xs ${settings.grayscaleMode ? 'text-emerald-700' : 'text-gray-600'}`}
                >
                  Grayscale
                </div>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${settings.reducedMotion ? 'bg-emerald-50' : 'bg-gray-50'}`}
              >
                <div
                  className={`text-lg font-bold ${settings.reducedMotion ? 'text-emerald-600' : 'text-gray-400'}`}
                >
                  {settings.reducedMotion ? 'ON' : 'OFF'}
                </div>
                <div
                  className={`text-xs ${settings.reducedMotion ? 'text-emerald-700' : 'text-gray-600'}`}
                >
                  Reduced Motion
                </div>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${settings.linkUnderline ? 'bg-emerald-50' : 'bg-gray-50'}`}
              >
                <div
                  className={`text-lg font-bold ${settings.linkUnderline ? 'text-emerald-600' : 'text-gray-400'}`}
                >
                  {settings.linkUnderline ? 'ON' : 'OFF'}
                </div>
                <div
                  className={`text-xs ${settings.linkUnderline ? 'text-emerald-700' : 'text-gray-600'}`}
                >
                  Link Underlines
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Built-In Accessibility Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {accessibilityFeatures.map((category, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {category.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {category.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-start text-sm text-gray-600"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions & Browser Shortcuts
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Keyboard className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">{item.action}</h3>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <code className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg">
                    {item.shortcut}
                  </code>
                  <span className="text-xl font-bold text-gray-400">
                    {item.icon}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback Section */}
        <section className="bg-linear-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Help Us Improve Accessibility
            </h2>
            <p className="mb-6 text-emerald-100">
              Found an accessibility barrier? Have suggestions for improvement?
              Your feedback helps us create a more inclusive platform for
              everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-emerald-700 hover:bg-gray-100"
              >
                <a href="mailto:accessibility@propsafehub.com?subject=Accessibility Feedback">
                  Email Feedback
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <a href="tel:+2349023558992">Call Support</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Commitment */}
        <div className="mt-16 text-center">
          <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-6">
            <Heart className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Our Commitment to Inclusion
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Accessibility is not an afterthought—it&apos;s a core principle at
            PropSafe Hub. We continuously monitor, test, and improve our
            platform to ensure equal access to real estate opportunities for
            everyone.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            This accessibility statement was last reviewed and updated on
            December 15, 2024.
          </p>
        </div>
      </div>
    </div>
  )
}
