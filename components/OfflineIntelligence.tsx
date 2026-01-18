/**
 * Offline Intelligence Dashboard
 * Premium ML-powered insights and recommendations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, Zap, Target, Award, Flame, Clock,
  ChefHat, Sparkles, AlertTriangle, CheckCircle, Star,
  Leaf, Scale, Trophy, Rocket, Activity, BarChart3,
  PieChart as PieChartIcon, Shield, Cpu, Box, Calendar,
  X, ChevronRight, Info, Eye, TrendingDown, AlertOctagon
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Ingredient } from '../types';
import { offlineFeatures } from '../services/offlineFeaturesService';
import { SavedRecipe } from '../types';
import offlineML from '../services/offlineML';

interface OfflineIntelligenceProps {
  isOpen: boolean;
  onClose: () => void;
  currentInventory: Ingredient[];
}

type InsightTab = 'overview' | 'recommendations' | 'expiration' | 'skills' | 'optimization';

export const OfflineIntelligence: React.FC<OfflineIntelligenceProps> = ({
  isOpen,
  onClose,
  currentInventory
}) => {
  const [activeTab, setActiveTab] = useState<InsightTab>('overview');
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [expirations, setExpirations] = useState<any[]>([]);
  const [skillMetrics, setSkillMetrics] = useState<any>(null);
  const [pantryHealth, setPantryHealth] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadIntelligence();
    }
  }, [isOpen, currentInventory]);

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      const allRecipes = await offlineFeatures.getAllRecipes();
      setRecipes(allRecipes);

      // Load recommendations
      const recs = await offlineML.recommendRecipes(currentInventory, allRecipes, 0.5);
      setRecommendations(recs.slice(0, 10));

      // Load expiration predictions
      const exp = currentInventory.map(ing => offlineML.predictExpiration(ing));
      setExpirations(exp.sort((a, b) => a.predictedExpirationDays - b.predictedExpirationDays));

      // Load skill metrics
      const skills = offlineML.analyzeSkillProgression(allRecipes);
      setSkillMetrics(skills);

      // Load pantry health
      const health = await offlineML.analyzePantryHealth(currentInventory, allRecipes);
      setPantryHealth(health);

      // Load meal plan
      const plan = await offlineML.optimizeMealPlan(currentInventory, 7, 2);
      setMealPlan(plan);
    } catch (err) {
      console.error('Intelligence loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const COLORS = ['#d4af37', '#c19a2f', '#ae8527', '#9b701f', '#886017', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="fixed inset-0 z-[500] bg-neutral-950/85 backdrop-blur-3xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full bg-white overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-2xl border-b border-neutral-200">
          <div className="max-w-[1800px] mx-auto px-10 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center shadow-lg">
                  <Brain size={26} className="text-primary-400" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-neutral-900">
                    Culinary Intelligence
                  </h1>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.12em] mt-1.5 flex items-center gap-2">
                    <Cpu size={11} strokeWidth={3} />
                    Offline ML Engine · {currentInventory.length} Ingredients · {recipes.length} Recipes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all duration-200"
              >
                <X size={20} className="text-neutral-700" strokeWidth={2.5} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {[
                { id: 'overview' as InsightTab, label: 'Overview', icon: Activity },
                { id: 'recommendations' as InsightTab, label: 'Smart Recommendations', icon: Sparkles },
                { id: 'expiration' as InsightTab, label: 'Expiration Intelligence', icon: AlertTriangle },
                { id: 'skills' as InsightTab, label: 'Skill Progression', icon: Trophy },
                { id: 'optimization' as InsightTab, label: 'Pantry Optimization', icon: Target },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.08em] transition-all duration-200 whitespace-nowrap flex items-center gap-2.5 ${
                      activeTab === tab.id
                        ? 'bg-neutral-900 text-white shadow-md'
                        : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Icon size={14} strokeWidth={2.5} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1800px] mx-auto px-10 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Cpu size={48} className="mx-auto mb-5 text-neutral-900" strokeWidth={2} />
                <p className="text-2xl font-black text-neutral-900">Processing Intelligence...</p>
                <p className="text-xs font-semibold text-neutral-500 mt-2 uppercase tracking-wide">Analyzing patterns with offline ML</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'recommendations' && renderRecommendations()}
              {activeTab === 'expiration' && renderExpiration()}
              {activeTab === 'skills' && renderSkills()}
              {activeTab === 'optimization' && renderOptimization()}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );

  function renderOverview() {
    return (
      <motion.div
        key="overview"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Shield size={28} className="text-white/80" strokeWidth={2} />
              <CheckCircle size={20} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-4xl font-black text-white mb-1.5">
              {Math.round((pantryHealth?.utilizationRate || 0) * 100)}%
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
              Pantry Utilization
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-7 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <AlertOctagon size={28} className="text-white/80" strokeWidth={2} />
              <Clock size={20} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-4xl font-black text-white mb-1.5">
              {expirations.filter(e => e.urgency === 'high' || e.urgency === 'critical').length}
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
              Expiring Soon
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Sparkles size={28} className="text-white/80" strokeWidth={2} />
              <TrendingUp size={20} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-4xl font-black text-white mb-1.5">
              {recommendations.length}
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
              AI Suggestions
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-7 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Trophy size={28} className="text-white/80" strokeWidth={2} />
              <Award size={20} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-4xl font-black text-white mb-1.5">
              {Math.round((skillMetrics?.overallLevel || 0) * 100)}
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
              Skill Level
            </div>
          </motion.div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle size={24} className="text-rose-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Priority Alerts</h3>
            </div>
            <div className="space-y-4">
              {expirations.slice(0, 5).map((exp, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 ${
                    exp.urgency === 'critical' ? 'bg-rose-50 border-rose-200' :
                    exp.urgency === 'high' ? 'bg-amber-50 border-amber-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-neutral-900">
                        {currentInventory.find(i => i.id === exp.ingredientId)?.name || 'Unknown'}
                      </div>
                      <div className="text-xs font-semibold text-neutral-600 mt-1">
                        Expires in {exp.predictedExpirationDays} day(s)
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      exp.urgency === 'critical' ? 'bg-rose-600 text-white' :
                      exp.urgency === 'high' ? 'bg-amber-600 text-white' :
                      'bg-emerald-600 text-white'
                    }`}>
                      {exp.urgency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-primary-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Top Recommendations</h3>
            </div>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, idx) => {
                const recipe = recipes.find(r => r.id === rec.recipeId);
                if (!recipe) return null;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-2xl border border-primary-200/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-black text-sm text-neutral-900">
                          {recipe.protocol.name}
                        </div>
                        <div className="text-xs font-semibold text-neutral-600 mt-1">
                          Match: {Math.round(rec.score * 100)}% · {recipe.protocol.cuisineStyle}
                        </div>
                      </div>
                      <div className="text-2xl font-black text-primary-600">
                        #{idx + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  function renderRecommendations() {
    return (
      <motion.div
        key="recommendations"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="p-8 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles size={28} className="text-primary-400" strokeWidth={2.5} />
            <h2 className="text-3xl font-black text-white">ML-Powered Recipe Recommendations</h2>
          </div>
          <p className="text-sm font-semibold text-white/70">
            Advanced collaborative filtering + content-based recommendation engine analyzing ingredient match, cooking history, seasonal relevance, nutrition, and skill level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, idx) => {
            const recipe = recipes.find(r => r.id === rec.recipeId);
            if (!recipe) return null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-neutral-200/60 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-xs font-black text-primary-600 uppercase tracking-wider mb-2">
                      Rank #{idx + 1}
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 line-clamp-2">
                      {recipe.protocol.name}
                    </h3>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">
                      {recipe.protocol.cuisineStyle}
                    </p>
                  </div>
                  <div className="text-3xl font-black text-primary-600">
                    {Math.round(rec.score * 100)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Ingredient Match
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                          style={{ width: `${rec.factors.ingredientMatch * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-black text-neutral-900">
                      {Math.round(rec.factors.ingredientMatch * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Historical Preference
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-violet-600"
                          style={{ width: `${rec.factors.historicalPreference * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-black text-neutral-900">
                      {Math.round(rec.factors.historicalPreference * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Nutrition Balance
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                          style={{ width: `${rec.factors.nutritionalBalance * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-black text-neutral-900">
                      {Math.round(rec.factors.nutritionalBalance * 100)}%
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-600">Seasonal: {Math.round(rec.factors.seasonalRelevance * 100)}%</span>
                    <span className="font-semibold text-neutral-600">Skill: {Math.round(rec.factors.skillLevel * 100)}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  function renderExpiration() {
    const criticalItems = expirations.filter(e => e.urgency === 'critical');
    const highItems = expirations.filter(e => e.urgency === 'high');
    const mediumItems = expirations.filter(e => e.urgency === 'medium');

    return (
      <motion.div
        key="expiration"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="p-8 bg-gradient-to-br from-rose-900 to-rose-800 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle size={28} className="text-rose-300" strokeWidth={2.5} />
            <h2 className="text-3xl font-black text-white">Expiration Intelligence</h2>
          </div>
          <p className="text-sm font-semibold text-white/70">
            ML prediction model analyzing vitality scores, ingredient categories, and storage conditions to prevent food waste
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-200">
            <div className="text-5xl font-black text-rose-700 mb-2">{criticalItems.length}</div>
            <div className="text-sm font-bold text-rose-600 uppercase tracking-wider">Critical (1-2 days)</div>
          </div>
          <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-200">
            <div className="text-5xl font-black text-amber-700 mb-2">{highItems.length}</div>
            <div className="text-sm font-bold text-amber-600 uppercase tracking-wider">High (3-5 days)</div>
          </div>
          <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-200">
            <div className="text-5xl font-black text-emerald-700 mb-2">{mediumItems.length}</div>
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Medium (6+ days)</div>
          </div>
        </div>

        <div className="space-y-4">
          {expirations.map((exp, idx) => {
            const ingredient = currentInventory.find(i => i.id === exp.ingredientId);
            if (!ingredient) return null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-6 rounded-3xl border-2 ${
                  exp.urgency === 'critical' ? 'bg-rose-50/80 border-rose-300' :
                  exp.urgency === 'high' ? 'bg-amber-50/80 border-amber-300' :
                  exp.urgency === 'medium' ? 'bg-blue-50/80 border-blue-300' :
                  'bg-emerald-50/80 border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      exp.urgency === 'critical' ? 'bg-rose-600' :
                      exp.urgency === 'high' ? 'bg-amber-600' :
                      exp.urgency === 'medium' ? 'bg-blue-600' :
                      'bg-emerald-600'
                    }`}>
                      <AlertTriangle size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-neutral-900">{ingredient.name}</h3>
                      <p className="text-sm font-semibold text-neutral-600">{ingredient.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-neutral-900">{exp.predictedExpirationDays}</div>
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Days Left</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {exp.recommendations.map((rec: string, ridx: number) => (
                    <div key={ridx} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                      <Info size={16} className="text-neutral-600 mt-0.5" strokeWidth={2.5} />
                      <p className="text-sm font-semibold text-neutral-700">{rec}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-300/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-600">Confidence: {Math.round(exp.confidence * 100)}%</span>
                    <span className="font-bold text-neutral-600">Vitality: {ingredient.vitality_score}/100</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  function renderSkills() {
    if (!skillMetrics) return null;

    const milestoneData = skillMetrics.milestones.map((m: any) => ({
      name: m.name,
      progress: m.progress * 100
    }));

    const cuisineData = Object.entries(skillMetrics.cuisineExpertise).map(([name, value]) => ({
      name,
      value
    }));

    return (
      <motion.div
        key="skills"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="p-8 bg-gradient-to-br from-violet-900 to-violet-800 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Trophy size={28} className="text-violet-300" strokeWidth={2.5} />
            <h2 className="text-3xl font-black text-white">Skill Progression Analysis</h2>
          </div>
          <p className="text-sm font-semibold text-white/70">
            ML-driven skill assessment analyzing technique mastery, cuisine expertise, and difficulty progression
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <ChefHat size={32} className="text-white/80" strokeWidth={2} />
              <Award size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-6xl font-black text-white mb-2">
              {Math.round(skillMetrics.overallLevel * 100)}
            </div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Overall Level</div>
          </div>

          <div className="p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Zap size={32} className="text-white/80" strokeWidth={2} />
              <Star size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-6xl font-black text-white mb-2">
              {skillMetrics.techniquesMastered.length}
            </div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Techniques Mastered</div>
          </div>

          <div className="p-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Flame size={32} className="text-white/80" strokeWidth={2} />
              <Rocket size={24} className="text-white/60" strokeWidth={2} />
            </div>
            <div className="text-6xl font-black text-white mb-2 capitalize">
              {skillMetrics.recommendedNextLevel}
            </div>
            <div className="text-sm font-bold text-white/80 uppercase tracking-wider">Recommended Level</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-violet-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Achievement Milestones</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={milestoneData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fontWeight: 700 }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="progress" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon size={24} className="text-primary-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Cuisine Expertise</h3>
            </div>
            {cuisineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cuisineData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cuisineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-neutral-400 font-semibold">No cuisine data yet</p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
          <h3 className="text-xl font-black text-neutral-900 mb-6">Techniques Mastered</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {skillMetrics.techniquesMastered.map((tech: string, idx: number) => (
              <div
                key={idx}
                className="px-4 py-3 bg-gradient-to-r from-primary-50 to-transparent rounded-xl border border-primary-200/40"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary-600" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-neutral-900">{tech}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  function renderOptimization() {
    if (!pantryHealth || !mealPlan) return null;

    return (
      <motion.div
        key="optimization"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="p-8 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Target size={28} className="text-emerald-300" strokeWidth={2.5} />
            <h2 className="text-3xl font-black text-white">Pantry Optimization Engine</h2>
          </div>
          <p className="text-sm font-semibold text-white/70">
            Advanced ML algorithms for meal planning, waste reduction, and ingredient efficiency maximization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} className="text-emerald-600" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-neutral-900 mb-2">
              {Math.round(mealPlan.ingredientEfficiency * 100)}%
            </div>
            <div className="text-sm font-bold text-neutral-600 uppercase tracking-wider">
              Ingredient Efficiency
            </div>
          </div>

          <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Scale size={32} className="text-violet-600" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-neutral-900 mb-2">
              {Math.round(mealPlan.totalNutritionalBalance * 100)}%
            </div>
            <div className="text-sm font-bold text-neutral-600 uppercase tracking-wider">
              Nutrition Balance
            </div>
          </div>

          <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Leaf size={32} className="text-primary-600" strokeWidth={2} />
            </div>
            <div className="text-5xl font-black text-neutral-900 mb-2">
              {Math.round(pantryHealth.wasteReduction)}%
            </div>
            <div className="text-sm font-bold text-neutral-600 uppercase tracking-wider">
              Waste Reduction
            </div>
          </div>
        </div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={24} className="text-primary-600" strokeWidth={2.5} />
            <h3 className="text-xl font-black tracking-tight text-neutral-900">Optimized 7-Day Meal Plan</h3>
          </div>
          <div className="space-y-3">
            {mealPlan.plan.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-5 bg-gradient-to-r from-primary-50 via-white to-transparent rounded-2xl border border-primary-200/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center font-black">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-black text-sm text-neutral-900">{item.recipeName}</div>
                      <div className="text-xs font-semibold text-neutral-600 mt-1">
                        {item.day} · {item.meal}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Nutrition Score
                    </div>
                    <div className="text-2xl font-black text-primary-600">
                      {Math.round(item.nutritionalScore * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {pantryHealth.underutilizedItems.length > 0 && (
          <motion.div
            whileHover={{ y: -2 }}
            className="p-8 bg-amber-50/80 backdrop-blur-xl rounded-3xl border-2 border-amber-200 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle size={24} className="text-amber-600" strokeWidth={2.5} />
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Underutilized Ingredients</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pantryHealth.underutilizedItems.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="px-4 py-3 bg-white/60 rounded-xl border border-amber-300/40"
                >
                  <span className="text-sm font-bold text-neutral-900">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-amber-700 mt-4">
              💡 These ingredients appear infrequently in your cooking history. Consider incorporating them more!
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  }
};

export default OfflineIntelligence;
