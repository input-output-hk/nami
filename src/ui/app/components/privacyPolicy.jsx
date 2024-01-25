import React from 'react';
import {
  Box,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  UnorderedList,
  ListItem,
  Link,
} from '@chakra-ui/react';
import { Scrollbars } from './scrollbar';

const PrivacyPolicy = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));
  return (
    <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader fontSize="md">Privacy Policy</ModalHeader>

        <ModalBody pr="0.5">
          <Scrollbars style={{ width: '100%', height: '400px' }}>
            <Box width="92%">
              <Text mb="3">Last updated September 6, 2023</Text>

              <Text mb="3">
                Thank you for choosing to be part of our community at Input
                Output Global, Inc., (together with our subsidiaries and
                affiliates, "IOG", "we", "us", or "our"). This Privacy Policy
                applies to all personal information collected through this
                website and all of IOG's related websites, mobile apps,
                products, services, sales, marketing or events, including our
                plug-ins and browser extensions (collectively, the{' '}
                <Text display="inline" fontWeight="bold">
                  "Products"
                </Text>
                ).
              </Text>

              <Text mb="3">
                We are committed to protecting your personal information. When
                you access or use our Products, you trust us with your personal
                information. In this Privacy Policy, we describe how we collect,
                use, store and share your personal information and what rights
                you have in relation to it. If there are any terms in this
                Privacy Policy that you do not agree with, please discontinue
                access and use of our Products.
              </Text>

              <Text mb="4">
                Please read this Privacy Policy carefully as it will help you
                make informed decisions about sharing your personal information
                with us.
              </Text>

              <Text mb="3" fontWeight="bold">
                1. Collection of Data
              </Text>
              <Text mb="4">
                IOG collects several types of information for various purposes
                to provide and improve the Products for your use.
              </Text>

              <Text mb="4" fontWeight="bold">
                Types of Data Collected
              </Text>
              <UnorderedList>
                <ListItem>
                  <Text fontWeight="bold">Personal Data</Text>
                  <Text mb="4">
                    While using the Products, IOG may ask you to provide certain
                    personally identifiable information that can be used to
                    contact or identify you (
                    <Text display="inline" fontWeight="bold">
                      "Personal Data"
                    </Text>
                    ), which may include, but is not limited to:
                  </Text>
                  <UnorderedList mb="4" styleType="circle">
                    <ListItem>Email address</ListItem>
                    <ListItem>First name and last name</ListItem>
                    <ListItem>Phone number</ListItem>
                    <ListItem>
                      Address, State, Province, ZIP/Postal code, City
                    </ListItem>
                    <ListItem>Cookies and Usage Data</ListItem>
                  </UnorderedList>
                  <Text mb="4">
                    Your Personal Data may be used to contact you with
                    newsletters, marketing or promotional materials and other
                    information that may be of interest to you. You may opt out
                    of receiving any, or all, of these communications by
                    following the unsubscribe link or instructions provided in
                    any email sent to you by IOG.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold">Usage Information</Text>
                  <Text mb="4">
                    Usage Information refers to information collected from
                    Products such as what action has been applied to Products
                    such as clicking logs; your registration details or how you
                    may be using Products.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold">IP Address</Text>
                  <Text mb="4">
                    When you use Products, we may automatically log your IP
                    address (the unique address which identifies your computer
                    on the internet) which is automatically recognized by our
                    server.
                  </Text>
                </ListItem>
              </UnorderedList>

              <Text mb="3" fontWeight="bold">
                2. Use of Data
              </Text>
              <Text mb="2">
                Specifically, IOG uses your information for the purpose for
                which you provided it to us such as:
              </Text>
              <UnorderedList mb="4">
                <ListItem>To notify you about changes to Products</ListItem>
                <ListItem>
                  To allow you to participate in interactive features of
                  Products when you choose to do so
                </ListItem>
                <ListItem>To provide customer support</ListItem>
                <ListItem>
                  To gather analysis or valuable information so that we can
                  improve the website
                </ListItem>
                <ListItem>To monitor the usage of Products</ListItem>
                <ListItem>
                  To detect, prevent and address technical issues
                </ListItem>
                <ListItem>
                  To provide you with news, special offers and general
                  information about other goods, services and events which IOG
                  offers that are similar to those that you have already
                  purchased or enquired about unless you have opted not to
                  receive such information
                </ListItem>
              </UnorderedList>
              <Text mb="4">
                Where and as permitted under applicable law, IOG may process
                your contact information for direct marketing purposes (e.g.,
                event invitations, newsletters) and to carry out customer
                satisfaction surveys, in each case also by email. You may object
                to the processing of your contact data for these purposes at any
                time by writing to{' '}
                <Link href="mailto:legal@iohk.io">legal@iohk.io</Link> or by
                using the opt-out mechanism provided in the respective
                communication you received.
              </Text>

              <Text mb="4" fontWeight="bold">
                3. Legal Basis under General Data Protection Regulation (GDPR)
              </Text>
              <Text mb="3">
                For a citizen or resident of a member country of the European
                Union (EU) or the European Economic Area (EEA), the legal basis
                for collecting and using Personal Data described in this Privacy
                Policy depends on the Personal Data being collected and the
                specific context in which it is collected as described below:
              </Text>
              <Text mb="2">IOG may process your Personal Data because:</Text>
              <UnorderedList mb="3">
                <ListItem>IOG needs to perform a contract with you</ListItem>
                <ListItem>You have given us permission to do so</ListItem>
                <ListItem>
                  The processing derives from IOG's legitimate interests
                </ListItem>
                <ListItem>IOG has to comply with applicable law</ListItem>
              </UnorderedList>
              <Text mb="3">
                The legal basis for IOG processing data about you is that it is
                necessary for the purposes of:
              </Text>
              <UnorderedList mb="3">
                <ListItem>
                  IOG exercising its rights and performing its obligations in
                  connection with any contract we make with you (Article 6 (1)
                  (b) General Data Protection Regulation),
                </ListItem>
                <ListItem>
                  Compliance with IOG's legal obligations (Article 6 (1) (c)
                  General Data Protection Regulation), and/or
                </ListItem>
                <ListItem>
                  Legitimate interests pursued by IOG (Article 6 (1) (f) General
                  Data Protection Regulation).
                </ListItem>
              </UnorderedList>
              <Text mb="3">
                Generally the legitimate interest pursued by IOG in relation to
                our use of your personal data is the efficient performance or
                management of our business relationship with you.
              </Text>
              <Text mb="4">
                In some cases, we may ask if you consent to the relevant use of
                your personal data. In such cases, the legal basis for IOG
                processing that data about you may (in addition or instead) be
                that you have consented (Article 6 (1) (a) General Data
                Protection Regulation).
              </Text>

              <Text mb="3" fontWeight="bold">
                4. Retention of Data
              </Text>
              <Text mb="3">
                IOG will retain your Personal Data only for as long as is
                necessary for the purposes set out in this Privacy Policy. IOG
                will retain and use your Personal Data to the extent necessary
                to comply with our legal obligations (for example, if IOG is
                required to retain your Personal Data to comply with applicable
                laws), resolve disputes, and enforce legal agreements and
                policies.
              </Text>
              <Text mb="4">
                IOG will also retain Usage Data for internal analysis purposes.
                Usage Data is generally retained for a shorter period of time,
                except when this data is used to strengthen the security or to
                improve the functionality of Products, or IOG is legally
                obligated to retain such data for longer time periods.
              </Text>

              <Text mb="3" fontWeight="bold">
                5. Transfer Of Data
              </Text>
              <Text mb="3">
                Your information, including Personal Data, may be transferred to
                — and maintained on — computers located outside of your state,
                province, country or other governmental jurisdiction where the
                data protection laws may differ from those from your
                jurisdiction.
              </Text>
              <Text mb="3">
                Your use of Products under the IOG Terms of Use followed by your
                submission of your personal information constitutes your
                unreserved agreement to this Privacy Policy in general and the
                transfer of data under this policy in particular.
              </Text>
              <Text mb="4">
                IOG will take all steps reasonably necessary to ensure that your
                data is treated securely and in accordance with this Privacy
                Policy and no transfer of your Personal Data will take place to
                an organization or a country unless there are adequate controls
                in place including the security of your data and other personal
                information.
              </Text>

              <Text mb="3" fontWeight="bold">
                6. Disclosure Of Data
              </Text>
              <Text mb="3" fontWeight="bold">
                Legal Requirements
              </Text>
              <Text mb="2">
                IOG may disclose your Personal Data in good faith belief that
                such disclosure is necessary to:
              </Text>
              <UnorderedList mb="3">
                <ListItem>To comply with a legal obligation</ListItem>
                <ListItem>
                  To protect and defend the rights or property of IOG
                </ListItem>
                <ListItem>
                  To prevent or investigate possible wrongdoing in connection
                  with Products
                </ListItem>
                <ListItem>
                  To protect the personal safety of users of Products or the
                  public
                </ListItem>
                <ListItem>To protect against legal liability</ListItem>
              </UnorderedList>
              <Text fontWeight="bold">
                Disclosure of Personal Information Within The EU
              </Text>
              <Text mb="3">
                Insofar as we employ the services of service providers to
                implement or fulfill any tasks on our behalf the contractual
                relations will be regulated in writing according to the
                provisions of the European General Data Protection Regulation
                (EU-GDPR) and the Federal Data Protection Act (new BDSG).
              </Text>
              <Text fontWeight="bold">
                Disclosure of Personal Information Outside of The EU
              </Text>
              <Text mb="3">
                Insofar as you have selected and consented to this in the form,
                your data will be disclosed to our offices within the network of
                affiliated companies outside of the European economic area for
                the processing of your enquiry. These offices are legally
                obligated to abide by the EU-GDPR. Furthermore, between the
                legally autonomous companies in the network of affiliated
                companies written agreements exist for the processing of data on
                commission, based on standardized contract stipulations.
              </Text>
              <Text mb="4" fontWeight="bold">
                7. Security Of Data
              </Text>
              <Text mb="3">
                We use reasonable technical and organizational methods to
                safeguard your information, for example, by password protecting
                (via usernames and passwords unique to you) certain parts of the
                Products and by using SSL encryption and firewalls to protect
                against unauthorized access, disclosure, alteration or
                destruction. However, please note that this is not a guarantee
                that such information may not be accessed, disclosed, altered or
                destroyed by breach of such firewalls and secure server
                software.
              </Text>
              <Text mb="3">
                Whilst we will use all reasonable efforts to safeguard your
                information, you acknowledge that data transmissions over the
                internet cannot be guaranteed to be 100% secure and for this
                reason we cannot guarantee the security or integrity of any
                Personal Information that is transferred from you or to you via
                the internet and as such, any information you transfer to IOG is
                done at your own risk.
              </Text>
              <Text mb="3">
                Where we have given you (or where you have chosen) a password
                which enables you to access certain parts of our site, you are
                responsible for keeping this password confidential. We ask you
                not to share a password with anyone.
              </Text>
              <Text mb="4">
                If we learn of a security systems breach we may attempt to
                notify you electronically so that you can take appropriate
                protective steps. By using Products or providing Personal
                Information to us you agree that we can communicate with you
                electronically regarding security, privacy and administrative
                issues relating to your use of Products. We may post a notice on
                Products if a security breach occurs. We may also send an email
                to you at the email address you have provided to us in these
                circumstances. Depending on where you live, you may have a legal
                right to receive notice of a security breach in writing.
              </Text>

              <Text mb="4" fontWeight="bold">
                8. Rights Under General Data Protection Regulation (GDPR)
              </Text>
              <Text mb="3">
                If you are a citizen or resident of a member country of the
                European Union (EU) or the European Economic Area (EEA), you
                have certain data protection rights. IOG aims to take reasonable
                steps to allow you to correct, amend, delete, or limit the use
                of your Personal Data.
              </Text>

              <Text mb="3">
                If you wish to be informed what Personal Data IOG holds about
                you and if you want it to be removed from our systems, please
                contact us{' '}
                <Link href="mailto:legal@iohk.io">legal@iohk.io</Link>.
              </Text>
              <Text mb="2">
                In certain circumstances, you have the following data protection
                rights:
              </Text>
              <UnorderedList mb="3">
                <ListItem>
                  <Text display="inline" fontWeight="bold">
                    The right to access.
                  </Text>{' '}
                  You have the right to request information concerning the
                  personal information we hold that relates to you.
                </ListItem>
                <ListItem>
                  <Text display="inline" fontWeight="bold">
                    The right of rectification.
                  </Text>{' '}
                  You have the right to have your information rectified if that
                  information is inaccurate or incomplete.
                </ListItem>
                <ListItem>
                  <Text display="inline" fontWeight="bold">
                    The right to object.
                  </Text>{' '}
                  You have the right to object to your personal information
                  being used for a particular purpose and you can exercise these
                  rights, for example, via an unsubscribe link at the bottom of
                  any email.
                </ListItem>
                <ListItem>
                  <Text display="inline" fontWeight="bold">
                    The right of restriction.
                  </Text>{' '}
                  You have the right to request that IOG restricts the
                  processing of your personal information.
                </ListItem>
                <ListItem>
                  <Text display="inline" fontWeight="bold">
                    The right to data portability.
                  </Text>{' '}
                  You have the right to be provided with a copy of the
                  information IOG has on you in a structured, machine readable
                  and commonly used format.
                </ListItem>
                <ListItem>
                  <Text display="inline" fontWeight="bold">
                    The right to withdraw consent.
                  </Text>{' '}
                  You also have the right to withdraw your consent at any time
                  where IOG relied on your consent to process your personal
                  information.
                </ListItem>
              </UnorderedList>
              <Text mb="3">
                Please note that IOG may ask you to verify your identity before
                responding to such requests.
              </Text>
              <Text mb="4">
                You have the right to complain to a Data Protection Authority
                about our collection and use of your Personal Data. For more
                information, please contact your local data protection authority
                in the EU or EEA.
              </Text>

              <Text mb="4" fontWeight="bold">
                9. California Residents
              </Text>
              <Text mb="3" fontWeight="bold">
                If you are a California resident, you have certain rights with
                respect to your personal information pursuant to the California
                Consumer Privacy Act of 2018 (“CCPA”). This section applies to
                you.
              </Text>
              <Text mb="3" fontWeight="bold">
                We are required to inform you of: (i) what categories of
                information we collect about you, including during the preceding
                12 months, (ii) the purposes for which we use your personal
                data, including during the preceding 12 months, and (iii) the
                purposes for which we share your personal data, including during
                the preceding 12 months.
              </Text>
              <Text mb="3">
                You have the right to: (i) request a copy of the personal
                information that we have about you; (ii) request that we delete
                your personal information; and (iii) opt-out of the sale of your
                personal information. You can limit the use of tracking
                technologies, such as cookies, by following instructions in the
                “Your choices” section. These rights are subject to limitations
                as described in the CCPA.
              </Text>
              <Text mb="3">
                We will not discriminate against any consumer for exercising
                their CCPA rights.
              </Text>
              <Text mb="4">
                If you would like to exercise any of these rights, please
                contact us at{' '}
                <Link href="mailto:legal@iohk.io">legal@iohk.io</Link>.
              </Text>

              <Text mb="4" fontWeight="bold">
                10. Service Providers, Plugins and Tools
              </Text>
              <Text mb="3">
                IOG may employ third party companies and individuals to
                facilitate Products, to provide the Products on our behalf, to
                perform website-related services or to assist us in analyzing
                how the Products are used (
                <Text display="inline" fontWeight="bold">
                  "Service Providers"
                </Text>
                ).
              </Text>
              <Text mb="3">
                These Service Providers have access to your Personal Data only
                to perform these tasks on our behalf and are obligated not to
                disclose or use it for any other purpose.
              </Text>
              <Text fontWeight="bold">Social Media</Text>
              <Text mb="3">
                IOG may use social media plugins to enable a better user
                experience with the use of Products.
              </Text>

              <Text fontWeight="bold">Youtube</Text>
              <Text mb="3">
                IOG uses the YouTube video platform operated by YouTube LLC, 901
                Cherry Ave. San Bruno, CA 94066 USA. YouTube is a platform that
                enables playback of audio and video files. If you visit one of
                our pages featuring a YouTube plugin, a connection to the
                YouTube servers is established. Here the YouTube server is
                informed about which of our pages you have visited. If you’re
                logged in to your YouTube account, YouTube allows you to
                associate your browsing behavior directly with your personal
                profile. You can prevent this by logging out of your YouTube
                account. YouTube is used to help make our website appealing. For
                information about the scope and purpose of data collection, the
                further processing and use of the data by YouTube and your
                rights and the settings you can configure to protect your
                privacy, please refer to the YouTube Privacy Guidelines.
              </Text>

              <Text fontWeight="bold">Analytics</Text>
              <Text mb="3">
                IOG may use Service Providers to monitor and analyze the use of
                Products such as Matomo and/or PostHog.
              </Text>

              <Text fontWeight="bold">Newsletter</Text>
              <Text mb="3">
                If you would like to receive our newsletter, we require a valid
                email address as well as information that allows us to verify
                that you are the owner of the specified email address and that
                you agree to receive this newsletter. No additional data is
                collected or is only collected on a voluntary basis. We only use
                this data to send the requested information and do not pass it
                on to third parties. We will, therefore, process any data you
                enter onto the contact form only with your consent per (Article
                6 (1) (a) General Data Protection Regulation). You can revoke
                consent to the storage and use of your data and email address
                for sending the newsletter at any time, e.g., through the
                "unsubscribe" link in the newsletter. The data processed before
                we receive your request may still be legally processed. The data
                provided when registering for the newsletter will be used to
                distribute the newsletter until you cancel your subscription
                when said data will be deleted. Data we have stored for other
                purposes (e.g., email addresses for members areas) remain
                unaffected.
              </Text>

              <Text fontWeight="bold">Newsletter Tracking</Text>
              <Text mb="3">
                Newsletter tracking (also referred to as Web beacons or tracking
                pixels) is used if users have given their explicit prior
                consent. When the newsletter is dispatched, the external server
                can then record certain data related to the recipient, such as
                the time and date the newsletter is retrieved, the IP address or
                details regarding the email program (client) used. The name of
                the image file is personalized for every email recipient by a
                unique ID being appended to it. The sender of the email notes
                which ID belongs to which email address and is thus able to
                determine which newsletter recipient has just opened the email
                when the image is called.
              </Text>
              <Text mb="4">
                You may revoke your consent at any time by unsubscribing to the
                newsletter. This can be done by sending an email request to
                unsubscribe to{' '}
                <Link href="mailto:dataprotection@iohk.io">
                  dataprotection@iohk.io
                </Link>
                . You may also remove yourself from the mailing list using the
                unsubscribe link in the newsletter.
              </Text>
              <Text mb="4" fontWeight="bold">
                11. Links To Other Products
              </Text>
              <Text mb="3">
                Products may contain links to other products that are not
                operated by IOG. If you click on a third-party link, you will be
                directed to that third party's site. You’re advised to review
                the privacy policy of each non-IOG site you decide to visit.
              </Text>
              <Text mb="4">
                IOG has no control over and assumes no responsibility for the
                content, privacy policies or practices of any third-party
                product or service.
              </Text>

              <Text mb="4" fontWeight="bold">
                12. Changes To This Privacy Policy
              </Text>
              <Text mb="3">
                IOG may update this Privacy Policy from time to time. Such
                changes will be posted on this page. The effective date of such
                changes will be notified via email and/or a prominent notice on
                the Product, with an update to the "effective date" at the top of
                this Privacy Policy.
              </Text>
              <Text mb="3">
                You are advised to review this Privacy Policy periodically for
                any changes. Changes to this Privacy Policy are effective when
                they are posted on this page.
              </Text>

              <Text mb="4" fontWeight="bold">
                13. Data Privacy Contact
              </Text>
              <Text mb="4">
                You can reach our data protection officer at{' '}
                <Link href="mailto:dataprotection@iohk.io">
                  dataprotection@iohk.io
                </Link>
                .
              </Text>

              <Text mb="4" fontWeight="bold">
                14. Contact by E-mail or Contact Form
              </Text>
              <Text mb="3">
                When you contact us by e-mail or through a contact form, we
                store the data you provide (your email address, possibly your
                name and telephone number) so we can answer your questions.
                Insofar as we use our contact form to request entries that are
                not required for contacting you, we have marked these as
                optional. This information serves to substantiate your inquiry
                and improve the handling of your request. Your message may be
                linked to various actions taken by you on the IOG website.
                Information collected will be solely used to provide you with
                support relating to your inquiry and better understand your
                feedback. A statement of this information is expressly provided
                on a voluntary basis and with your consent. As far as this
                concerns information about communication channels (such as
                e-mail address or telephone number), you also agree that we may,
                where appropriate, contact you via this communication channel to
                answer your request. You may of course revoke this consent for
                the future at any time.
              </Text>
              <Text mb="3">
                We delete the data that arises in this context after saving is
                no longer required, or limit processing if there are statutory
                retention requirements.
              </Text>
              <Box h="2" />
            </Box>
          </Scrollbars>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default PrivacyPolicy;
