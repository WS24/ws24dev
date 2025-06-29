// Comprehensive UI Audit Script for Production Readiness
// Run this in browser DevTools console to check for issues

(function comprehensiveUIAudit() {
  console.log('🔍 Starting Comprehensive UI Audit...\n');
  
  const issues = [];
  
  // 1. Audit Internal Links
  console.log('1. Checking Internal Links...');
  const links = Array.from(document.querySelectorAll('a'));
  const brokenLinks = links.filter(link => {
    const href = link.getAttribute('href');
    return !href || 
           href === '#' || 
           href === 'javascript:void(0)' || 
           href.includes('javascript:') ||
           href === '' ||
           href === '/#';
  });
  
  if (brokenLinks.length > 0) {
    issues.push('Broken/Placeholder Links Found');
    console.table(brokenLinks.map(l => ({ 
      text: l.innerText?.trim() || l.textContent?.trim() || '[No text]', 
      href: l.getAttribute('href'),
      location: l.closest('[data-testid], .page, .component')?.className || 'Unknown'
    })));
  } else {
    console.log('✅ All links have valid hrefs');
  }
  
  // 2. Check for TODO/Placeholder Content
  console.log('\n2. Checking for TODO/Placeholder Content...');
  const textNodes = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.toLowerCase();
    if (text.includes('todo') || 
        text.includes('placeholder') || 
        text.includes('lorem ipsum') ||
        text.includes('coming soon') ||
        text.includes('under construction')) {
      textNodes.push({
        text: node.textContent.trim(),
        element: node.parentElement?.tagName || 'Unknown',
        location: node.parentElement?.className || 'No class'
      });
    }
  }
  
  if (textNodes.length > 0) {
    issues.push('TODO/Placeholder Content Found');
    console.table(textNodes);
  } else {
    console.log('✅ No TODO/placeholder content found');
  }
  
  // 3. Check Button Functionality
  console.log('\n3. Checking Button Functionality...');
  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
  const nonFunctionalButtons = buttons.filter(btn => {
    const onClick = btn.getAttribute('onclick');
    const hasEventListener = btn.onclick !== null;
    const hasReactProps = Object.keys(btn).some(key => key.startsWith('__react'));
    
    return !hasEventListener && !hasReactProps && (!onClick || onClick.includes('void(0)'));
  });
  
  if (nonFunctionalButtons.length > 0) {
    issues.push('Non-functional Buttons Found');
    console.table(nonFunctionalButtons.map(btn => ({
      text: btn.innerText?.trim() || btn.textContent?.trim() || '[No text]',
      type: btn.type || 'button',
      disabled: btn.disabled,
      location: btn.className || 'No class'
    })));
  } else {
    console.log('✅ All buttons appear functional');
  }
  
  // 4. Check Form Elements
  console.log('\n4. Checking Form Elements...');
  const forms = Array.from(document.querySelectorAll('form'));
  const formIssues = [];
  
  forms.forEach(form => {
    const action = form.getAttribute('action');
    const method = form.getAttribute('method');
    const onSubmit = form.getAttribute('onsubmit');
    const hasEventListener = form.onsubmit !== null;
    const hasReactProps = Object.keys(form).some(key => key.startsWith('__react'));
    
    if (!hasEventListener && !hasReactProps && (!onSubmit || onSubmit.includes('void(0)'))) {
      formIssues.push({
        id: form.id || 'No ID',
        action: action || 'No action',
        method: method || 'No method',
        location: form.className || 'No class'
      });
    }
  });
  
  if (formIssues.length > 0) {
    issues.push('Non-functional Forms Found');
    console.table(formIssues);
  } else {
    console.log('✅ All forms appear functional');
  }
  
  // 5. Check for Console Errors
  console.log('\n5. Checking Console Errors...');
  const originalError = console.error;
  const originalWarn = console.warn;
  let errorCount = 0;
  let warnCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    warnCount++;
    originalWarn.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
    
    if (errorCount > 0 || warnCount > 0) {
      issues.push(`Console Issues: ${errorCount} errors, ${warnCount} warnings`);
    }
  }, 1000);
  
  // 6. Check Navigation Menu Integrity
  console.log('\n6. Checking Navigation Menu...');
  const navLinks = Array.from(document.querySelectorAll('nav a, .sidebar a, .navigation a'));
  const navIssues = navLinks.filter(link => {
    const href = link.getAttribute('href');
    return !href || href === '#' || href.includes('javascript:');
  });
  
  if (navIssues.length > 0) {
    issues.push('Navigation Menu Issues');
    console.table(navIssues.map(link => ({
      text: link.innerText?.trim() || '[No text]',
      href: link.getAttribute('href'),
      location: 'Navigation'
    })));
  } else {
    console.log('✅ Navigation menu appears functional');
  }
  
  // 7. Check Responsive Design Elements
  console.log('\n7. Checking Responsive Design...');
  const responsiveIssues = [];
  const elementsToCheck = document.querySelectorAll('[class*="responsive"], [class*="mobile"], [class*="desktop"]');
  
  elementsToCheck.forEach(el => {
    const styles = window.getComputedStyle(el);
    if (styles.overflow === 'visible' && el.scrollWidth > el.clientWidth) {
      responsiveIssues.push({
        element: el.tagName,
        class: el.className,
        issue: 'Horizontal overflow detected'
      });
    }
  });
  
  if (responsiveIssues.length > 0) {
    issues.push('Responsive Design Issues');
    console.table(responsiveIssues);
  } else {
    console.log('✅ No obvious responsive issues detected');
  }
  
  // 8. Final Report
  console.log('\n' + '='.repeat(50));
  console.log('📋 UI AUDIT SUMMARY');
  console.log('='.repeat(50));
  
  if (issues.length === 0) {
    console.log('🎉 ALL CHECKS PASSED! UI is production-ready.');
  } else {
    console.log('❌ Issues Found:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.log('\n🔧 Please fix these issues before production deployment.');
  }
  
  console.log('\n📊 Overall Score:', `${Math.max(0, 100 - (issues.length * 15))}%`);
  
  return {
    passed: issues.length === 0,
    issues: issues,
    score: Math.max(0, 100 - (issues.length * 15))
  };
})();