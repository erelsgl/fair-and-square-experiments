set xrange [0:1]
set yrange [0:1.2]
set xlabel 'noise proportion'
set ylabel 'gain/loss'

f1(x)=a1*x+b1
f2(x)=a2*x+b2
f3(x)=a3*x+b3
fit f1(x) filename using 2:3 via a1,b1
fit f2(x) filename using 2:4 via a2,b2
fit f3(x) filename using 2:5 via a3,b3
plot \
	filename using 2:3 linetype rgb "blue" title 'egalitarian' with points, \
	f1(x) linetype rgb "blue" title '', \
	filename using 2:4 linetype rgb "green" title 'utilitarian' with points, \
	f2(x) linetype rgb "green" title '', \
	filename using 2:5 linetype rgb "red" title 'envy' with points, \
	f3(x) linetype rgb "red" title ''
