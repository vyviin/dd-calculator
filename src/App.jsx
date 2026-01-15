import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, GraduationCap, Save } from 'lucide-react';

const GradeConverter = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: '', university: 'UW', grade: '', credits: '' }
  ]);
  const [saveMessage, setSaveMessage] = useState('');

  // Load courses from localStorage on mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('dd-calculator-courses');
    if (savedCourses) {
      try {
        const parsed = JSON.parse(savedCourses);
        if (parsed && parsed.length > 0) {
          setCourses(parsed);
        }
      } catch (e) {
        console.error('Failed to load saved courses:', e);
      }
    }
  }, []);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('dd-calculator-courses', JSON.stringify(courses));
    }
  }, [courses]);

  const conversionTable = {
    UW: [
      { min: 90, max: 100, wluLetter: 'A+', wluPoints: 12, uwAvg: 95, gpa4: 4.0 },
      { min: 85, max: 89, wluLetter: 'A', wluPoints: 11, uwAvg: 89, gpa4: 3.9 },
      { min: 80, max: 84, wluLetter: 'A-', wluPoints: 10, uwAvg: 83, gpa4: 3.7 },
      { min: 77, max: 79, wluLetter: 'B+', wluPoints: 9, uwAvg: 78, gpa4: 3.3 },
      { min: 73, max: 76, wluLetter: 'B', wluPoints: 8, uwAvg: 75, gpa4: 3.0 },
      { min: 70, max: 72, wluLetter: 'B-', wluPoints: 7, uwAvg: 72, gpa4: 2.7 },
      { min: 67, max: 69, wluLetter: 'C+', wluPoints: 6, uwAvg: 68, gpa4: 2.3 },
      { min: 63, max: 66, wluLetter: 'C', wluPoints: 5, uwAvg: 65, gpa4: 2.0 },
      { min: 60, max: 62, wluLetter: 'C-', wluPoints: 4, uwAvg: 62, gpa4: 1.7 },
      { min: 57, max: 59, wluLetter: 'D+', wluPoints: 3, uwAvg: 58, gpa4: 1.3 },
      { min: 53, max: 56, wluLetter: 'D', wluPoints: 2, uwAvg: 55, gpa4: 1.0 },
      { min: 50, max: 52, wluLetter: 'D-', wluPoints: 1, uwAvg: 52, gpa4: 0.7 },
      { min: 0, max: 49, wluLetter: 'F', wluPoints: 0, uwAvg: 32, gpa4: 0.0 }
    ],
    WLU: [
      { letter: 'A+', points: 12, uwAvg: 95, gpa4: 4.0 },
      { letter: 'A', points: 11, uwAvg: 89, gpa4: 3.9 },
      { letter: 'A-', points: 10, uwAvg: 83, gpa4: 3.7 },
      { letter: 'B+', points: 9, uwAvg: 78, gpa4: 3.3 },
      { letter: 'B', points: 8, uwAvg: 75, gpa4: 3.0 },
      { letter: 'B-', points: 7, uwAvg: 72, gpa4: 2.7 },
      { letter: 'C+', points: 6, uwAvg: 68, gpa4: 2.3 },
      { letter: 'C', points: 5, uwAvg: 65, gpa4: 2.0 },
      { letter: 'C-', points: 4, uwAvg: 62, gpa4: 1.7 },
      { letter: 'D+', points: 3, uwAvg: 58, gpa4: 1.3 },
      { letter: 'D', points: 2, uwAvg: 55, gpa4: 1.0 },
      { letter: 'D-', points: 1, uwAvg: 52, gpa4: 0.7 },
      { letter: 'F', points: 0, uwAvg: 32, gpa4: 0.0 }
    ]
  };

  const convertGrade = (university, grade) => {
    if (!grade) return null;

    if (university === 'UW') {
      const numGrade = parseFloat(grade);
      if (isNaN(numGrade)) return null;
      
      const conversion = conversionTable.UW.find(
        c => numGrade >= c.min && numGrade <= c.max
      );
      return conversion || null;
    } else {
      const upperGrade = grade.trim().toUpperCase();
      const conversion = conversionTable.WLU.find(
        c => c.letter === upperGrade
      );
      
      if (!conversion) return null;
      
      return {
        wluLetter: conversion.letter,
        wluPoints: conversion.points,
        uwAvg: conversion.uwAvg,
        gpa4: conversion.gpa4
      };
    }
  };

  const addCourse = () => {
    const newId = Math.max(...courses.map(c => c.id), 0) + 1;
    setCourses([...courses, { id: newId, name: '', university: 'UW', grade: '', credits: '' }]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateAverages = () => {
    const validCourses = courses.filter(c => {
      if (!c.grade || !c.credits) return false;
      const credits = parseFloat(c.credits);
      if (isNaN(credits) || credits <= 0) return false;
      
      if (c.university === 'UW') {
        const numGrade = parseFloat(c.grade);
        return !isNaN(numGrade) && numGrade >= 0 && numGrade <= 100;
      } else {
        const conversion = convertGrade(c.university, c.grade);
        return conversion !== null && conversion !== undefined;
      }
    });

    if (validCourses.length === 0) return null;

    let uwTotal = 0;
    let wluTotal = 0;
    let totalCredits = 0;

    validCourses.forEach(course => {
      const credits = parseFloat(course.credits);
      
      if (course.university === 'UW') {
        const numGrade = parseFloat(course.grade);
        const conversion = convertGrade(course.university, course.grade);
        if (!conversion) return;
        
        uwTotal += numGrade * credits;
        wluTotal += conversion.wluPoints * credits;
      } else {
        const conversion = convertGrade(course.university, course.grade);
        if (!conversion) return;
        
        uwTotal += conversion.uwAvg * credits;
        wluTotal += conversion.wluPoints * credits;
      }
      
      totalCredits += credits;
    });

    if (totalCredits === 0) return null;

    return {
      uwAverage: (uwTotal / totalCredits).toFixed(2),
      wluAverage: (wluTotal / totalCredits).toFixed(2),
      gpa4: (validCourses.reduce((sum, c) => {
        const conv = convertGrade(c.university, c.grade);
        if (!conv) return sum;
        return sum + (conv.gpa4 * parseFloat(c.credits));
      }, 0) / totalCredits).toFixed(2),
      totalCredits: totalCredits.toFixed(1)
    };
  };

  const clearAllCourses = () => {
    if (confirm('Are you sure you want to clear all courses? This cannot be undone.')) {
      setCourses([{ id: 1, name: '', university: 'UW', grade: '', credits: '' }]);
      localStorage.removeItem('dd-calculator-courses');
      setSaveMessage('All courses cleared');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const results = calculateAverages();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <GraduationCap className="text-gray-700" size={28} strokeWidth={1.5} />
            <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900">UW/WLU GPA Calculator</h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            Enter your courses and grades to calculate your averages at both universities
          </p>
          {saveMessage && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
              <Save size={14} />
              {saveMessage}
            </div>
          )}
        </div>

        {/* Course Table - Desktop */}
        <div className="mb-6 sm:mb-8 hidden sm:block">
          <div className="grid grid-cols-12 gap-3 mb-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">Course Name</div>
            <div className="col-span-2">University</div>
            <div className="col-span-3">Grade</div>
            <div className="col-span-2">Credits</div>
            <div className="col-span-2">Converted</div>
          </div>

          {courses.map((course) => {
            const conversion = convertGrade(course.university, course.grade);
            return (
              <div key={course.id} className="grid grid-cols-12 gap-3 mb-2 items-center group">
                <input
                  type="text"
                  placeholder="e.g., MATH 135"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  className="col-span-3 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                
                <select
                  value={course.university}
                  onChange={(e) => updateCourse(course.id, 'university', e.target.value)}
                  className="col-span-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                >
                  <option value="UW">UW</option>
                  <option value="WLU">WLU</option>
                </select>

                <input
                  type="text"
                  placeholder={course.university === 'UW' ? '0-100' : 'A+, B, C-, etc.'}
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  className="col-span-3 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />

                <input
                  type="number"
                  step="0.5"
                  placeholder="0.5"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                  className="col-span-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />

                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {conversion ? (
                      <span>
                        {course.university === 'UW' 
                          ? `${conversion.wluLetter} (${conversion.wluPoints})`
                          : `${conversion.uwAvg}%`
                        }
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </span>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                    disabled={courses.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={addCourse}
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={20} className="text-gray-700" strokeWidth={1.5} />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Results</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-md border border-gray-200 p-3 sm:p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">UW Average</div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{results.uwAverage}%</div>
              </div>
              
              <div className="bg-white rounded-md border border-gray-200 p-3 sm:p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">WLU Average</div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{results.wluAverage}</div>
                <div className="text-xs text-gray-500">out of 12</div>
              </div>
              
              <div className="bg-white rounded-md border border-gray-200 p-3 sm:p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">4.0 GPA</div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{results.gpa4}</div>
                <div className="text-xs text-gray-500">out of 4.0</div>
              </div>
              
              <div className="bg-white rounded-md border border-gray-200 p-3 sm:p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Credits</div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{results.totalCredits}</div>
              </div>
            </div>

            <div className="mt-4 text-xs sm:text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-md p-3">
              <strong>Note:</strong> Your UW transcript shows the percentage average ({results.uwAverage}%), 
              while your WLU transcript shows the 12-point scale average ({results.wluAverage}).
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">How It Works</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li>• Enter your course grades using the grading system from each university (UW: 0-100, WLU: letter grades)</li>
            <li>• The calculator converts grades between systems and calculates both averages</li>
            <li>• UW courses are converted to WLU's 12-point scale for your WLU transcript</li>
            <li>• WLU courses are converted to percentages for your UW transcript</li>
            <li>• Example: A 76% at UW becomes a B (8 points) at WLU, but a B at WLU becomes 75% at UW</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GradeConverter;