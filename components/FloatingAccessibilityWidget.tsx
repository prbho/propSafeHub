'use client'

import { useState } from 'react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { Accessibility, Settings, X } from 'lucide-react'

export function FloatingAccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings } = useAccessibility()

  const quickSettings = [
    {
      label: 'Increase Text',
      action: () =>
        updateSettings({ fontSize: Math.min(settings.fontSize + 25, 200) }),
      icon: 'A+',
    },
    {
      label: 'Decrease Text',
      action: () =>
        updateSettings({ fontSize: Math.max(settings.fontSize - 25, 75) }),
      icon: 'A-',
    },
    {
      label: settings.highContrast ? 'Normal Mode' : 'High Contrast',
      action: () => updateSettings({ highContrast: !settings.highContrast }),
      icon: '⚫',
    },
    {
      label: settings.grayscaleMode ? 'Color Mode' : 'Grayscale',
      action: () => updateSettings({ grayscaleMode: !settings.grayscaleMode }),
      icon: '🎨',
    },
  ]

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-24 right-6 z-10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 bg-gray-800 cursor-pointer text-white rounded-full shadow-2xl hover:bg-gray-900 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Accessibility Settings"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Accessibility className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Quick Settings Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-72 bg-white rounded-xl shadow-2xl border p-6 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Quick Settings</h3>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3 mb-6">
            {quickSettings.map((setting, idx) => (
              <button
                key={idx}
                onClick={setting.action}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                  {setting.label}
                </span>
                <span className="text-lg font-bold text-gray-600">
                  {setting.icon}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-indigo-600">
                  {settings.fontSize}%
                </div>
                <div className="text-gray-600">Text Size</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-emerald-600">
                  {settings.highContrast ? 'ON' : 'OFF'}
                </div>
                <div className="text-gray-600">Contrast</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/accessibility"
              className="block w-full text-center py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Full Accessibility Settings →
            </a>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
