export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('sid') || 'default';
}

export async function fetchCustomState(sid) {
  try {
    const res = await fetch(`/state?sid=${sid}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export async function saveState(sid, state) {
  try {
    await fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    });
  } catch (e) {
    // ignore
  }
}

export async function initializeData(sid) {
  const custom = await fetchCustomState(sid);
  if (custom) return custom;
  const initial = createInitialData();
  // Save initial state to server
  try {
    await fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: initial })
    });
  } catch (e) {
    // ignore
  }
  return initial;
}

export function createInitialData() {
  return {
    currentUser: {
      id: 'user-1',
      name: 'Sarah Mitchell',
      email: 'smitchell@lawfirm.com',
      firm: 'Mitchell & Associates LLP',
      initials: 'SM'
    },
    cases: [
      {
        id: 'case-1',
        title: 'Brown v. Board of Education',
        citation: '347 U.S. 483 (1954)',
        court: 'Supreme Court of the United States',
        date: '1954-05-17',
        judge: 'Chief Justice Earl Warren',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'Equal Protection', 'Education'],
        synopsis: 'Landmark decision declaring state laws establishing separate public schools for black and white students to be unconstitutional. The Court held that "separate educational facilities are inherently unequal," overturning Plessy v. Ferguson.',
        headnotes: [
          { number: 1, topic: 'Constitutional Law', text: 'Segregation of children in public schools solely on the basis of race deprives children of the minority group of equal educational opportunities, even though physical facilities and other tangible factors may be equal.' },
          { number: 2, topic: 'Equal Protection', text: 'The doctrine of "separate but equal" has no place in the field of public education.' }
        ],
        holdings: [
          'Racial segregation in public education violates the Equal Protection Clause of the Fourteenth Amendment.',
          'The "separate but equal" doctrine adopted in Plessy v. Ferguson has no place in the field of public education.'
        ],
        opinion: [
          'These cases come to us from the States of Kansas, South Carolina, Virginia, and Delaware. They are premised on different facts and different local conditions, but a common legal question justifies their consideration together in this consolidated opinion.',
          'In each of the cases, minors of the Negro race, through their legal representatives, seek the aid of the courts in obtaining admission to the public schools of their community on a nonsegregated basis.',
          'In approaching this problem, we cannot turn the clock back to 1868 when the Amendment was adopted, or even to 1896 when Plessy v. Ferguson was written. We must consider public education in the light of its full development and its present place in American life throughout the Nation.',
          'Today, education is perhaps the most important function of state and local governments. Compulsory school attendance laws and the great expenditures for education both demonstrate our recognition of the importance of education to our democratic society.',
          'We conclude that in the field of public education the doctrine of "separate but equal" has no place. Separate educational facilities are inherently unequal.'
        ],
        citingReferences: ['case-3', 'case-5', 'case-8']
      },
      {
        id: 'case-2',
        title: 'Miranda v. Arizona',
        citation: '384 U.S. 436 (1966)',
        court: 'Supreme Court of the United States',
        date: '1966-06-13',
        judge: 'Chief Justice Earl Warren',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Criminal Law', 'Constitutional Law', 'Fifth Amendment'],
        synopsis: 'Established the requirement that law enforcement officials advise suspects of their right to remain silent and to an attorney during custodial interrogation. The ruling created the now-famous "Miranda warnings."',
        headnotes: [
          { number: 1, topic: 'Criminal Law', text: 'The prosecution may not use statements stemming from custodial interrogation of the defendant unless it demonstrates the use of procedural safeguards effective to secure the privilege against self-incrimination.' },
          { number: 2, topic: 'Fifth Amendment', text: 'Prior to any questioning, the person must be warned that he has a right to remain silent, that any statement he does make may be used as evidence against him, and that he has a right to the presence of an attorney.' }
        ],
        holdings: [
          'The prosecution may not use statements from custodial interrogation unless procedural safeguards were employed.',
          'The person in custody must be clearly informed of the right to remain silent and to have an attorney.'
        ],
        opinion: [
          'The cases before us raise questions which go to the roots of our concepts of American criminal jurisprudence: the restraints society must observe consistent with the Federal Constitution in prosecuting individuals for crime.',
          'More specifically, we deal with the admissibility of statements obtained from an individual who is subjected to custodial police interrogation and the necessity for procedures which assure that the individual is accorded his privilege under the Fifth Amendment to the Constitution not to be compelled to incriminate himself.',
          'We hold that when an individual is taken into custody or otherwise deprived of his freedom by the authorities in any significant way and is subjected to questioning, the privilege against self-incrimination is jeopardized.',
          'He must be warned prior to any questioning that he has the right to remain silent, that anything he says can be used against him in a court of law, that he has the right to the presence of an attorney, and that if he cannot afford an attorney one will be appointed for him prior to any questioning if he so desires.'
        ],
        citingReferences: ['case-4', 'case-7', 'case-10']
      },
      {
        id: 'case-3',
        title: 'Marbury v. Madison',
        citation: '5 U.S. (1 Cranch) 137 (1803)',
        court: 'Supreme Court of the United States',
        date: '1803-02-24',
        judge: 'Chief Justice John Marshall',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'Judicial Review', 'Separation of Powers'],
        synopsis: 'Established the principle of judicial review in the United States, affirming the power of federal courts to declare legislative and executive acts unconstitutional. This landmark case formed the basis for the exercise of judicial review under Article III.',
        headnotes: [
          { number: 1, topic: 'Constitutional Law', text: 'It is emphatically the province and duty of the judicial department to say what the law is.' },
          { number: 2, topic: 'Judicial Review', text: 'An act of the legislature repugnant to the constitution is void.' }
        ],
        holdings: [
          'The Supreme Court has the power of judicial review to strike down laws that violate the Constitution.',
          'A law repugnant to the Constitution is void, and courts are bound by the Constitution above ordinary legislation.'
        ],
        opinion: [
          'The question whether an act repugnant to the Constitution can become the law of the land is a question deeply interesting to the United States.',
          'The Constitution is either a superior paramount law, unchangeable by ordinary means, or it is on a level with ordinary legislative acts, and, like other acts, is alterable when the legislature shall please to alter it.',
          'It is emphatically the province and duty of the Judicial Department to say what the law is. Those who apply the rule to particular cases must, of necessity, expound and interpret that rule.',
          'Thus, the particular phraseology of the Constitution of the United States confirms and strengthens the principle, supposed to be essential to all written Constitutions, that a law repugnant to the Constitution is void, and that courts, as well as other departments, are bound by that instrument.'
        ],
        citingReferences: ['case-1', 'case-5']
      },
      {
        id: 'case-4',
        title: 'Roe v. Wade',
        citation: '410 U.S. 113 (1973)',
        court: 'Supreme Court of the United States',
        date: '1973-01-22',
        judge: 'Justice Harry Blackmun',
        type: 'case',
        keyciteFlag: 'red',
        topics: ['Constitutional Law', 'Privacy', 'Due Process'],
        synopsis: 'Held that the Constitution protects a pregnant woman\'s liberty to choose to have an abortion without excessive government restriction. The decision was later overturned by Dobbs v. Jackson Women\'s Health Organization (2022).',
        headnotes: [
          { number: 1, topic: 'Constitutional Law', text: 'The right of personal privacy includes the abortion decision, but this right is not unqualified and must be considered against important state interests in regulation.' },
          { number: 2, topic: 'Due Process', text: 'State criminal abortion laws that except from criminality only a life-saving procedure on behalf of the mother violate the Due Process Clause of the Fourteenth Amendment.' }
        ],
        holdings: [
          'The right of personal privacy includes the abortion decision, subject to state regulation.',
          'The state has legitimate interests in protecting both the pregnant woman\'s health and the potentiality of human life.'
        ],
        opinion: [
          'This Texas federal appeal and its Georgia companion, Doe v. Bolton, present constitutional challenges to state criminal abortion legislation.',
          'The Texas statutes under attack here are typical of those that have been in effect in many States for approximately a century. The Georgia statutes, in contrast, have a modern cast, and are a legislative product that, to an extent at least, obviously reflects the influences of recent attitudinal change.',
          'We forthwith acknowledge our awareness of the sensitive and emotional nature of the abortion controversy, of the vigorous opposing views, even among physicians, and of the deep and seemingly absolute convictions that the subject inspires.',
          'The Constitution does not explicitly mention any right of privacy. In a line of decisions, however, the Court has recognized that a right of personal privacy, or a guarantee of certain areas or zones of privacy, does exist under the Constitution.'
        ],
        citingReferences: ['case-6', 'case-11']
      },
      {
        id: 'case-5',
        title: 'Gideon v. Wainwright',
        citation: '372 U.S. 335 (1963)',
        court: 'Supreme Court of the United States',
        date: '1963-03-18',
        judge: 'Justice Hugo Black',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Criminal Law', 'Sixth Amendment', 'Right to Counsel'],
        synopsis: 'Unanimously ruled that states are required under the Sixth Amendment to the U.S. Constitution to provide an attorney to defendants in criminal cases who are unable to afford their own attorneys.',
        headnotes: [
          { number: 1, topic: 'Sixth Amendment', text: 'The Sixth Amendment\'s guarantee of counsel is a fundamental right essential to a fair trial, made obligatory upon the States by the Fourteenth Amendment.' }
        ],
        holdings: [
          'The right to counsel is fundamental and essential to a fair trial.',
          'States must provide counsel in criminal cases to defendants unable to afford their own.'
        ],
        opinion: [
          'Petitioner was charged in a Florida state court with having broken and entered a poolroom with intent to commit a misdemeanor. This offense is a felony under Florida law.',
          'Since 1942, when Betts v. Brady was decided by a divided Court, the problem of a defendant\'s federal constitutional right to counsel in a state court has been a continuing source of controversy and litigation in both state and federal courts.',
          'We accept Betts v. Brady\'s assumption, based as it was on our prior cases, that a provision of the Bill of Rights which is "fundamental and essential to a fair trial" is made obligatory upon the States by the Fourteenth Amendment.',
          'The right of one charged with crime to counsel may not be deemed fundamental and essential to fair trials in some countries, but it is in ours.'
        ],
        citingReferences: ['case-2', 'case-7']
      },
      {
        id: 'case-6',
        title: 'Mapp v. Ohio',
        citation: '367 U.S. 643 (1961)',
        court: 'Supreme Court of the United States',
        date: '1961-06-19',
        judge: 'Justice Tom C. Clark',
        type: 'case',
        keyciteFlag: 'yellow',
        topics: ['Criminal Law', 'Fourth Amendment', 'Exclusionary Rule'],
        synopsis: 'Established that evidence obtained in violation of the Fourth Amendment protection against unreasonable searches and seizures may not be used in state law criminal prosecutions in state courts, extending the exclusionary rule to the states.',
        headnotes: [
          { number: 1, topic: 'Fourth Amendment', text: 'All evidence obtained by searches and seizures in violation of the Constitution is inadmissible in a state court.' }
        ],
        holdings: [
          'The exclusionary rule applies to state courts through the Fourteenth Amendment.',
          'Evidence obtained through unconstitutional searches is inadmissible in state criminal proceedings.'
        ],
        opinion: [
          'Appellant stands convicted of knowingly having had in her possession and under her control certain lewd and lascivious books, pictures, and photographs in violation of Ohio statute.',
          'The State says that even if the search were made without authority, or otherwise unreasonably, it is not prevented from using the unconstitutionally seized evidence at trial.',
          'Since the Fourth Amendment\'s right of privacy has been declared enforceable against the States through the Due Process Clause of the Fourteenth Amendment, it is enforceable against them by the same sanction of exclusion as is used against the Federal Government.'
        ],
        citingReferences: ['case-2', 'case-9']
      },
      {
        id: 'case-7',
        title: 'New York Times Co. v. Sullivan',
        citation: '376 U.S. 254 (1964)',
        court: 'Supreme Court of the United States',
        date: '1964-03-09',
        judge: 'Justice William J. Brennan Jr.',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'First Amendment', 'Defamation'],
        synopsis: 'Established the "actual malice" standard for press reporting about public officials. The Court held that the First Amendment protects the publication of all statements about public officials unless the statement was made with knowledge of its falsity.',
        headnotes: [
          { number: 1, topic: 'First Amendment', text: 'A public official may not recover damages for a defamatory falsehood relating to official conduct unless he proves the statement was made with actual malice.' }
        ],
        holdings: [
          'The First Amendment protects publication of statements about public officials unless made with actual malice.',
          'Actual malice means knowledge of falsity or reckless disregard of whether the statement was false.'
        ],
        opinion: [
          'We are required in this case to determine for the first time the extent to which the constitutional protections for speech and press limit a State\'s power to award damages in a libel action brought by a public official against critics of his official conduct.',
          'We hold that the rule of law applied by the Alabama courts is constitutionally deficient for failure to provide the safeguards for freedom of speech and of the press that are required by the First and Fourteenth Amendments in a libel action brought by a public official against critics of his official conduct.',
          'The constitutional guarantees require, we think, a federal rule that prohibits a public official from recovering damages for a defamatory falsehood relating to his official conduct unless he proves that the statement was made with actual malice.'
        ],
        citingReferences: ['case-12']
      },
      {
        id: 'case-8',
        title: 'Obergefell v. Hodges',
        citation: '576 U.S. 644 (2015)',
        court: 'Supreme Court of the United States',
        date: '2015-06-26',
        judge: 'Justice Anthony Kennedy',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'Equal Protection', 'Due Process', 'Marriage'],
        synopsis: 'Held that the fundamental right to marry is guaranteed to same-sex couples by both the Due Process Clause and the Equal Protection Clause of the Fourteenth Amendment to the United States Constitution.',
        headnotes: [
          { number: 1, topic: 'Equal Protection', text: 'Same-sex couples may exercise the fundamental right to marry in all States, and there is no lawful basis for a State to refuse to recognize a lawful same-sex marriage performed in another State.' }
        ],
        holdings: [
          'The right to marry is a fundamental right inherent in the liberty of the person, guaranteed to same-sex couples.',
          'States must recognize same-sex marriages lawfully performed in other States.'
        ],
        opinion: [
          'The Constitution promises liberty to all within its reach, a liberty that includes certain specific rights that allow persons, within a lawful realm, to define and express their identity.',
          'The petitioners in these cases seek to find that liberty by marrying someone of the same sex and having their marriages deemed lawful on the same terms and conditions as marriages between persons of the opposite sex.',
          'The right to marry is fundamental as a matter of history and tradition, and under the Court\'s substantive due process precedents, it cannot be restricted on the basis of sexual orientation.',
          'No union is more profound than marriage, for it embodies the highest ideals of love, fidelity, devotion, sacrifice, and family.'
        ],
        citingReferences: ['case-1']
      },
      {
        id: 'case-9',
        title: 'Tinker v. Des Moines Independent Community School District',
        citation: '393 U.S. 503 (1969)',
        court: 'Supreme Court of the United States',
        date: '1969-02-24',
        judge: 'Justice Abe Fortas',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'First Amendment', 'Education', 'Student Rights'],
        synopsis: 'Defined the constitutional rights of students in U.S. public schools, holding that students do not "shed their constitutional rights to freedom of speech or expression at the schoolhouse gate."',
        headnotes: [
          { number: 1, topic: 'First Amendment', text: 'Students do not shed their constitutional rights to freedom of speech or expression at the schoolhouse gate. School officials cannot suppress expression unless they can show it would materially and substantially interfere with the operation of the school.' }
        ],
        holdings: [
          'Students retain First Amendment rights in public schools.',
          'Student expression may only be suppressed if it materially and substantially disrupts school operations.'
        ],
        opinion: [
          'Petitioner John F. Tinker, 15 years old, and petitioner Christopher Eckhardt, 16 years old, attended high schools in Des Moines, Iowa. Petitioner Mary Beth Tinker, John\'s sister, was a 13-year-old student in junior high school.',
          'In December 1965, a group of adults and students in Des Moines held a meeting at the Eckhardt home. The group determined to publicize their objections to the hostilities in Vietnam and their support for a truce by wearing black armbands during the holiday season.',
          'It can hardly be argued that either students or teachers shed their constitutional rights to freedom of speech or expression at the schoolhouse gate.',
          'In order for the State in the person of school officials to justify prohibition of a particular expression of opinion, it must be able to show that its action was caused by something more than a mere desire to avoid the discomfort and unpleasantness that always accompany an unpopular viewpoint.'
        ],
        citingReferences: ['case-1']
      },
      {
        id: 'case-10',
        title: 'Terry v. Ohio',
        citation: '392 U.S. 1 (1968)',
        court: 'Supreme Court of the United States',
        date: '1968-06-10',
        judge: 'Chief Justice Earl Warren',
        type: 'case',
        keyciteFlag: 'yellow',
        topics: ['Criminal Law', 'Fourth Amendment', 'Search and Seizure'],
        synopsis: 'Established the constitutionality of "stop and frisk" procedures, holding that police may briefly detain and pat down a person if the officer has reasonable suspicion that criminal activity is afoot.',
        headnotes: [
          { number: 1, topic: 'Fourth Amendment', text: 'Where a police officer observes unusual conduct which leads him reasonably to conclude that criminal activity may be afoot, he may briefly stop the suspicious person and make reasonable inquiries.' }
        ],
        holdings: [
          'A police officer may stop and frisk a suspect based on reasonable suspicion of criminal activity.',
          'The Fourth Amendment applies to stop-and-frisk encounters but the standard is reasonable suspicion, not probable cause.'
        ],
        opinion: [
          'This case presents serious questions concerning the role of the Fourth Amendment in the confrontation on the street between the citizen and the policeman investigating suspicious circumstances.',
          'Petitioner Terry was convicted of carrying a concealed weapon and sentenced to the statutorily prescribed term of one to three years in the penitentiary.',
          'We merely hold today that, where a police officer observes unusual conduct which leads him reasonably to conclude in light of his experience that criminal activity may be afoot and that the persons with whom he is dealing may be armed and presently dangerous, he is entitled for the protection of himself and others in the area to conduct a carefully limited search of the outer clothing of such persons in an attempt to discover weapons which might be used to assault him.'
        ],
        citingReferences: ['case-6']
      },
      {
        id: 'case-11',
        title: 'Citizens United v. Federal Election Commission',
        citation: '558 U.S. 310 (2010)',
        court: 'Supreme Court of the United States',
        date: '2010-01-21',
        judge: 'Justice Anthony Kennedy',
        type: 'case',
        keyciteFlag: 'yellow',
        topics: ['Constitutional Law', 'First Amendment', 'Election Law', 'Campaign Finance'],
        synopsis: 'Held that the free speech clause of the First Amendment prohibits the government from restricting independent expenditures for political communications by corporations, associations, or labor unions.',
        headnotes: [
          { number: 1, topic: 'First Amendment', text: 'Political speech does not lose First Amendment protection simply because its source is a corporation.' }
        ],
        holdings: [
          'The First Amendment prohibits restrictions on independent political expenditures by corporations and unions.',
          'The government may not suppress political speech on the basis of the speaker\'s corporate identity.'
        ],
        opinion: [
          'Federal law prohibits corporations and unions from using their general treasury funds to make independent expenditures for speech defined as an "electioneering communication" or for speech expressly advocating the election or defeat of a candidate.',
          'The Government may regulate corporate political speech through disclaimer and disclosure requirements, but it may not suppress that speech altogether.',
          'If the First Amendment has any force, it prohibits Congress from fining or jailing citizens, or associations of citizens, for simply engaging in political speech.'
        ],
        citingReferences: ['case-7']
      },
      {
        id: 'case-12',
        title: 'Shelby County v. Holder',
        citation: '570 U.S. 529 (2013)',
        court: 'Supreme Court of the United States',
        date: '2013-06-25',
        judge: 'Chief Justice John Roberts',
        type: 'case',
        keyciteFlag: 'orange',
        topics: ['Constitutional Law', 'Voting Rights', 'Equal Sovereignty'],
        synopsis: 'Struck down Section 4(b) of the Voting Rights Act of 1965, which established the coverage formula determining which jurisdictions were subject to Section 5 preclearance requirements.',
        headnotes: [
          { number: 1, topic: 'Voting Rights', text: 'The Voting Rights Act\'s coverage formula in Section 4(b) is unconstitutional because conditions that originally justified these measures no longer characterize voting in the covered jurisdictions.' }
        ],
        holdings: [
          'Section 4(b) of the Voting Rights Act is unconstitutional as it imposes current burdens based on outdated conditions.'
        ],
        opinion: [
          'The Voting Rights Act of 1965 employed extraordinary measures to address an extraordinary problem. Section 5 of the Act required States to obtain federal permission before enacting any law related to voting.',
          'Nearly 50 years later, they are still in effect; indeed, they have been made more stringent, and are now scheduled to last until 2031. There is no denying, however, that the conditions that originally justified these measures no longer characterize voting in the covered jurisdictions.',
          'Our decision in no way affects the permanent, nationwide ban on racial discrimination in voting found in Section 2. We issue no holding on Section 5 itself, only on the coverage formula.'
        ],
        citingReferences: ['case-1']
      },
      {
        id: 'case-13',
        title: 'Griswold v. Connecticut',
        citation: '381 U.S. 479 (1965)',
        court: 'Supreme Court of the United States',
        date: '1965-06-07',
        judge: 'Justice William O. Douglas',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'Privacy', 'Due Process'],
        synopsis: 'Established the right to marital privacy, striking down a Connecticut law that prohibited the use of contraceptives. The decision found that the specific guarantees in the Bill of Rights have penumbras that create zones of privacy.',
        headnotes: [
          { number: 1, topic: 'Privacy', text: 'The specific guarantees in the Bill of Rights have penumbras, formed by emanations from those guarantees that help give them life and substance, creating zones of privacy.' }
        ],
        holdings: [
          'The Bill of Rights creates zones of privacy that protect married couples\' decisions regarding contraception.'
        ],
        opinion: [
          'Appellant Griswold is Executive Director of the Planned Parenthood League of Connecticut. Appellant Buxton is a licensed physician and a professor at the Yale Medical School who served as Medical Director for the League at its Center in New Haven.',
          'The present case, then, concerns a relationship lying within the zone of privacy created by several fundamental constitutional guarantees.',
          'We deal with a right of privacy older than the Bill of Rights—older than our political parties, older than our school system. Marriage is a coming together for better or for worse, hopefully enduring, and intimate to the degree of being sacred.'
        ],
        citingReferences: ['case-4']
      },
      {
        id: 'case-14',
        title: 'Loving v. Virginia',
        citation: '388 U.S. 1 (1967)',
        court: 'Supreme Court of the United States',
        date: '1967-06-12',
        judge: 'Chief Justice Earl Warren',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Constitutional Law', 'Equal Protection', 'Due Process', 'Marriage'],
        synopsis: 'Struck down all state laws banning interracial marriage as violations of the Equal Protection and Due Process Clauses of the Fourteenth Amendment.',
        headnotes: [
          { number: 1, topic: 'Equal Protection', text: 'Virginia\'s statutory scheme to prevent marriages between persons solely on the basis of racial classifications violates the Equal Protection and Due Process Clauses of the Fourteenth Amendment.' }
        ],
        holdings: [
          'Anti-miscegenation laws violate both the Equal Protection Clause and the Due Process Clause.',
          'The freedom to marry is one of the vital personal rights essential to the orderly pursuit of happiness.'
        ],
        opinion: [
          'This case presents a constitutional question never addressed by this Court: whether a statutory scheme adopted by the State of Virginia to prevent marriages between persons solely on the basis of racial classifications violates the Equal Protection and Due Process Clauses of the Fourteenth Amendment.',
          'Marriage is one of the "basic civil rights of man," fundamental to our very existence and survival. To deny this fundamental freedom on so unsupportable a basis as the racial classifications embodied in these statutes, classifications so directly subversive of the principle of equality at the heart of the Fourteenth Amendment, is surely to deprive all the State\'s citizens of liberty without due process of law.',
          'The freedom to marry, or not marry, a person of another race resides with the individual, and cannot be infringed by the State.'
        ],
        citingReferences: ['case-8']
      },
      {
        id: 'case-15',
        title: 'Katz v. United States',
        citation: '389 U.S. 347 (1967)',
        court: 'Supreme Court of the United States',
        date: '1967-12-18',
        judge: 'Justice Potter Stewart',
        type: 'case',
        keyciteFlag: 'green',
        topics: ['Criminal Law', 'Fourth Amendment', 'Privacy', 'Search and Seizure'],
        synopsis: 'Expanded the Fourth Amendment\'s protection against unreasonable searches and seizures to include the electronic surveillance of conversations. The "reasonable expectation of privacy" test was established in Justice Harlan\'s concurrence.',
        headnotes: [
          { number: 1, topic: 'Fourth Amendment', text: 'The Fourth Amendment protects people, not places. What a person knowingly exposes to the public is not subject to Fourth Amendment protection, but what he seeks to preserve as private, even in an area accessible to the public, may be constitutionally protected.' }
        ],
        holdings: [
          'The Fourth Amendment protects people\'s reasonable expectation of privacy, not just physical spaces.',
          'Electronic surveillance of phone calls constitutes a search under the Fourth Amendment.'
        ],
        opinion: [
          'The petitioner was convicted in the District Court for the Southern District of California under an eight-count indictment charging him with transmitting wagering information by telephone from Los Angeles to Miami and Boston.',
          'At trial the Government was permitted, over the petitioner\'s objection, to introduce evidence of the petitioner\'s end of telephone conversations, overheard by FBI agents who had attached an electronic listening and recording device to the outside of the public telephone booth from which he had placed his calls.',
          'The Government\'s activities in electronically listening to and recording the petitioner\'s words violated the privacy upon which he justifiably relied while using the telephone booth and thus constituted a "search and seizure" within the meaning of the Fourth Amendment.'
        ],
        citingReferences: ['case-10', 'case-6']
      }
    ],
    statutes: [
      {
        id: 'statute-1',
        title: '42 U.S.C. Section 1983 - Civil Action for Deprivation of Rights',
        citation: '42 U.S.C. \u00A7 1983',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'Every person who, under color of any statute, ordinance, regulation, custom, or usage, of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen of the United States or other person within the jurisdiction thereof to the deprivation of any rights, privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured in an action at law, suit in equity, or other proper proceeding for redress, except that in any action brought against a judicial officer for an act or omission taken in such officer\'s judicial capacity, injunctive relief shall not be granted unless a declaratory decree was violated or declaratory relief was unavailable.',
        annotations: [
          'This section provides a federal cause of action for the deprivation of constitutional rights by persons acting under color of state law.',
          'To state a claim under Section 1983, a plaintiff must allege: (1) deprivation of a federal right, and (2) that the deprivation was committed by a person acting under color of state law.',
          'Municipalities may be held liable under this section when the deprivation was caused by official policy or custom.'
        ],
        lastAmended: '1996-04-26',
        effectiveDate: '1871-04-20'
      },
      {
        id: 'statute-2',
        title: '18 U.S.C. Section 1341 - Frauds and Swindles (Mail Fraud)',
        citation: '18 U.S.C. \u00A7 1341',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'Whoever, having devised or intending to devise any scheme or artifice to defraud, or for obtaining money or property by means of false or fraudulent pretenses, representations, or promises, or to sell, dispose of, loan, exchange, alter, give away, distribute, supply, or furnish or procure for unlawful use any counterfeit or spurious coin, obligation, security, or other article, or anything represented to be or intimated or held out to be such counterfeit or spurious article, for the purpose of executing such scheme or artifice or attempting so to do, places in any post office or authorized depository for mail matter, any matter or thing whatever to be sent or delivered by the Postal Service, shall be fined under this title or imprisoned not more than 20 years, or both.',
        annotations: [
          'The mail fraud statute requires proof of: (1) a scheme to defraud, and (2) use of the mails in furtherance of the scheme.',
          'The statute has been broadly interpreted to cover virtually any scheme to deprive another of money, property, or honest services.'
        ],
        lastAmended: '2002-07-30',
        effectiveDate: '1948-06-25'
      },
      {
        id: 'statute-3',
        title: '28 U.S.C. Section 1332 - Diversity of Citizenship; Amount in Controversy',
        citation: '28 U.S.C. \u00A7 1332',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'The district courts shall have original jurisdiction of all civil actions where the matter in controversy exceeds the sum or value of $75,000, exclusive of interest and costs, and is between citizens of different States. For purposes of this section, an alien admitted to the United States for permanent residence shall be deemed a citizen of the State in which such alien is domiciled.',
        annotations: [
          'Diversity jurisdiction requires complete diversity - no plaintiff may be a citizen of the same state as any defendant.',
          'The amount in controversy is determined at the time of filing; subsequent events reducing the amount do not divest the court of jurisdiction.',
          'Corporate citizenship is determined by both the state of incorporation and the principal place of business.'
        ],
        lastAmended: '2011-12-07',
        effectiveDate: '1948-06-25'
      },
      {
        id: 'statute-4',
        title: 'U.S. Const. Amend. XIV - Equal Protection and Due Process',
        citation: 'U.S. Const. amend. XIV',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'Section 1. All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.',
        annotations: [
          'The Equal Protection Clause requires states to provide equal treatment to all persons within their jurisdiction.',
          'The Due Process Clause has been interpreted to incorporate most Bill of Rights protections against state action.',
          'Strict scrutiny applies to classifications based on race, national origin, or alienage; intermediate scrutiny applies to gender-based classifications.'
        ],
        lastAmended: null,
        effectiveDate: '1868-07-09'
      },
      {
        id: 'statute-5',
        title: '15 U.S.C. Section 1 - Sherman Antitrust Act',
        citation: '15 U.S.C. \u00A7 1',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'Every contract, combination in the form of trust or otherwise, or conspiracy, in restraint of trade or commerce among the several States, or with foreign nations, is declared to be illegal. Every person who shall make any contract or engage in any combination or conspiracy hereby declared to be illegal shall be deemed guilty of a felony, and, on conviction thereof, shall be punished by fine not exceeding $100,000,000 if a corporation, or, if any other person, $1,000,000, or by imprisonment not exceeding 10 years, or by both said punishments.',
        annotations: [
          'Section 1 requires an agreement between two or more parties; unilateral conduct is addressed under Section 2.',
          'The Supreme Court has interpreted the statute to prohibit only unreasonable restraints of trade, applying a "rule of reason" analysis.',
          'Per se violations include price fixing, market allocation, and bid rigging.'
        ],
        lastAmended: '2004-06-22',
        effectiveDate: '1890-07-02'
      },
      {
        id: 'statute-6',
        title: '29 U.S.C. Section 201 - Fair Labor Standards Act',
        citation: '29 U.S.C. \u00A7 201 et seq.',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'As declared by the Congress in the Fair Labor Standards Act of 1938, as amended, the existence in industries engaged in commerce or in the production of goods for commerce of labor conditions detrimental to the maintenance of the minimum standard of living necessary for health, efficiency, and general well-being of workers constitutes an unfair method of competition in commerce, burdens commerce and the free flow of goods in commerce, and leads to labor disputes burdening and obstructing commerce.',
        annotations: [
          'The FLSA establishes minimum wage, overtime pay, recordkeeping, and youth employment standards.',
          'The current federal minimum wage is $7.25 per hour, effective July 24, 2009.',
          'Overtime must be paid at not less than one and one-half times the regular rate of pay after 40 hours of work in a workweek.'
        ],
        lastAmended: '2007-05-25',
        effectiveDate: '1938-06-25'
      },
      {
        id: 'statute-7',
        title: '26 U.S.C. Section 501(c)(3) - Tax Exemption for Charitable Organizations',
        citation: '26 U.S.C. \u00A7 501(c)(3)',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'Corporations, and any community chest, fund, or foundation, organized and operated exclusively for religious, charitable, scientific, testing for public safety, literary, or educational purposes, or to foster national or international amateur sports competition, or for the prevention of cruelty to children or animals, no part of the net earnings of which inures to the benefit of any private shareholder or individual, no substantial part of the activities of which is carrying on propaganda, or otherwise attempting, to influence legislation, and which does not participate in, or intervene in, any political campaign on behalf of any candidate for public office.',
        annotations: [
          'Organizations must be organized and operated exclusively for exempt purposes.',
          'The prohibition on political campaign activity is absolute; no 501(c)(3) organization may participate in political campaigns.',
          'Lobbying activities must not constitute a substantial part of the organization\'s activities.'
        ],
        lastAmended: '2006-08-17',
        effectiveDate: '1954-08-16'
      },
      {
        id: 'statute-8',
        title: '17 U.S.C. Section 107 - Fair Use',
        citation: '17 U.S.C. \u00A7 107',
        type: 'statute',
        jurisdiction: 'Federal',
        text: 'Notwithstanding the provisions of sections 106 and 106A, the fair use of a copyrighted work, including such use by reproduction in copies or phonorecords or by any other means specified by that section, for purposes such as criticism, comment, news reporting, teaching (including multiple copies for classroom use), scholarship, or research, is not an infringement of copyright. In determining whether the use made of a work in any particular case is a fair use the factors to be considered shall include: (1) the purpose and character of the use, including whether such use is of a commercial nature or is for nonprofit educational purposes; (2) the nature of the copyrighted work; (3) the amount and substantiality of the portion used in relation to the copyrighted work as a whole; and (4) the effect of the use upon the potential market for or value of the copyrighted work.',
        annotations: [
          'Fair use is an affirmative defense to a claim of copyright infringement.',
          'The four factors are to be weighed together; no single factor is determinative.',
          'Transformative use—use that adds something new with a different purpose or character—weighs in favor of fair use.'
        ],
        lastAmended: '1992-10-24',
        effectiveDate: '1976-10-19'
      }
    ],
    folders: [
      {
        id: 'folder-1',
        name: 'Constitutional Law Research',
        createdAt: '2025-12-01T09:00:00Z',
        documentIds: ['case-1', 'case-3', 'case-8', 'statute-4']
      },
      {
        id: 'folder-2',
        name: 'Criminal Procedure Cases',
        createdAt: '2025-12-05T14:30:00Z',
        documentIds: ['case-2', 'case-5', 'case-6', 'case-10', 'case-15']
      },
      {
        id: 'folder-3',
        name: 'First Amendment Collection',
        createdAt: '2025-12-10T10:15:00Z',
        documentIds: ['case-7', 'case-9', 'case-11', 'statute-8']
      }
    ],
    history: [
      { id: 'hist-1', type: 'search', query: 'equal protection education segregation', timestamp: '2025-12-15T14:30:00Z', resultCount: 24 },
      { id: 'hist-2', type: 'document', documentId: 'case-1', title: 'Brown v. Board of Education', timestamp: '2025-12-15T14:32:00Z' },
      { id: 'hist-3', type: 'keycite', documentId: 'case-1', title: 'KeyCite - Brown v. Board of Education', timestamp: '2025-12-15T14:35:00Z' },
      { id: 'hist-4', type: 'search', query: 'Miranda rights custodial interrogation', timestamp: '2025-12-14T10:00:00Z', resultCount: 18 },
      { id: 'hist-5', type: 'document', documentId: 'case-2', title: 'Miranda v. Arizona', timestamp: '2025-12-14T10:05:00Z' },
      { id: 'hist-6', type: 'search', query: 'right to counsel criminal cases', timestamp: '2025-12-13T09:00:00Z', resultCount: 31 },
      { id: 'hist-7', type: 'document', documentId: 'case-5', title: 'Gideon v. Wainwright', timestamp: '2025-12-13T09:12:00Z' },
      { id: 'hist-8', type: 'search', query: 'fair use copyright defense', timestamp: '2025-12-12T16:20:00Z', resultCount: 15 },
      { id: 'hist-9', type: 'document', documentId: 'statute-8', title: '17 U.S.C. Section 107 - Fair Use', timestamp: '2025-12-12T16:25:00Z' },
      { id: 'hist-10', type: 'search', query: 'stop and frisk reasonable suspicion', timestamp: '2025-12-11T11:00:00Z', resultCount: 22 }
    ],
    notes: {},
    filters: {
      jurisdiction: 'All',
      dateRange: { from: '', to: '' },
      court: 'All',
      contentType: 'All'
    },
    searchQuery: '',
    searchResults: [],
    favorites: []
  };
}
