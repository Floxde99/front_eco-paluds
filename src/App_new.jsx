import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-white text-xl font-bold">Mon App ✨</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {['Accueil', 'À propos', 'Services', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <div className="md:hidden">
              <button className="text-white hover:text-purple-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 rounded-full mb-8 animate-float shadow-2xl">
              <span className="text-4xl">🚀</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Bienvenue dans le
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
                Futur du Web
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez une expérience utilisateur révolutionnaire avec des animations fluides, 
              un design moderne et des interactions immersives.
            </p>
          </div>

          {/* Interactive Tabs */}
          <div className="mb-12">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
                {[
                  { id: 'home', label: 'Accueil', icon: '🏠' },
                  { id: 'features', label: 'Fonctionnalités', icon: '⚡' },
                  { id: 'demo', label: 'Démo', icon: '🎮' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'home' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { icon: '⚡', title: 'Ultra Rapide', desc: 'Performance optimisée avec Vite et React 19' },
                      { icon: '🎨', title: 'Design Moderne', desc: 'Interface élégante avec Tailwind CSS v4' },
                      { icon: '🌟', title: 'Innovant', desc: 'Effets visuels et animations avancées' }
                    ].map((feature, index) => (
                      <div key={index} className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:rotate-1">
                        <div className="text-5xl mb-6 group-hover:animate-bounce">{feature.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-3xl font-bold text-white mb-8">Fonctionnalités Avancées</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { title: 'Responsive Design', desc: 'Parfaitement adapté à tous les écrans', progress: 100 },
                      { title: 'Animations Fluides', desc: 'Transitions et effets visuels immersifs', progress: 95 },
                      { title: 'Performance', desc: 'Optimisé pour la vitesse et l\'efficacité', progress: 98 },
                      { title: 'Accessibilité', desc: 'Conçu pour tous les utilisateurs', progress: 90 }
                    ].map((item, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-gray-300 mb-4">{item.desc}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-violet-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400 mt-2 block">{item.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'demo' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Counter Card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 max-w-lg mx-auto border border-white/20 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-6">Compteur Interactif</h2>
                    <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text mb-8 animate-pulse-glow">
                      {count}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setCount(count - 1)}
                        className="bg-red-500/80 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl active:scale-95"
                      >
                        <span className="text-2xl">−</span>
                      </button>
                      <button
                        onClick={() => setCount(0)}
                        className="bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl active:scale-95"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setCount(count + 1)}
                        className="bg-green-500/80 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl active:scale-95"
                      >
                        <span className="text-2xl">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-5 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl relative overflow-hidden">
                <span className="relative z-10">Commencer maintenant</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-5 px-10 rounded-full border border-white/20 transition-all duration-300 transform hover:scale-105 backdrop-blur-md hover:border-white/40">
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/5 backdrop-blur-md border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Mon App</h3>
              <p className="text-gray-400 text-sm">Créé avec passion et les dernières technologies web.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Liens</h4>
              <div className="space-y-2">
                {['Accueil', 'À propos', 'Services', 'Contact'].map((link) => (
                  <a key={link} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">{link}</a>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Ressources</h4>
              <div className="space-y-2">
                {['Documentation', 'Support', 'Blog', 'FAQ'].map((link) => (
                  <a key={link} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">{link}</a>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Suivez-nous</h4>
              <div className="flex space-x-4">
                {['🐦', '📘', '📷', '💼'].map((emoji, index) => (
                  <button key={index} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 Mon App. Créé avec ❤️ et Tailwind CSS v4
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
